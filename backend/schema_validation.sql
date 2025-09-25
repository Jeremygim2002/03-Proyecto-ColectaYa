-- =====================================================
-- QUERIES DE VALIDACIÓN - INTEGRIDAD DEL SCHEMA
-- Ejecutar en pgAdmin para verificar que todo funciona
-- =====================================================

-- =====================================================
-- 1. VERIFICAR QUE TODAS LAS TABLAS EXISTEN
-- =====================================================

SELECT 
    schemaname, 
    tablename, 
    hasindexes, 
    hasrules, 
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR ENUMS CREADOS
-- =====================================================

SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('Role', 'FundStatus', 'ParticipantStatus', 'ContributionStatus', 'ExpenseCategory')
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================
-- 3. VERIFICAR ESTRUCTURA DE CADA TABLA
-- =====================================================

-- Estructura de Users
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Estructura de Funds
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'funds' 
ORDER BY ordinal_position;

-- Estructura de Participants
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;

-- Estructura de Contributions
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
ORDER BY ordinal_position;

-- Estructura de Expenses
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'expenses' 
ORDER BY ordinal_position;

-- =====================================================
-- 4. VERIFICAR CLAVES FORÁNEAS (FOREIGN KEYS)
-- =====================================================

SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 5. VERIFICAR ÍNDICES CREADOS
-- =====================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'funds', 'participants', 'contributions', 'expenses')
ORDER BY tablename, indexname;

-- =====================================================
-- 6. VERIFICAR CONSTRAINTS ÚNICOS
-- =====================================================

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY') 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'funds', 'participants', 'contributions', 'expenses')
ORDER BY tc.table_name, tc.constraint_type, kcu.column_name;

-- =====================================================
-- 7. PROBAR QUERIES COMPLEJAS CON JOINS
-- =====================================================

-- Query compleja: Fondos con creadores y estadísticas
SELECT 
    f.id,
    f.title as "Fondo",
    u.name as "Creador",
    f."goalAmount" as "Meta",
    f."currentAmount" as "Recaudado",
    ROUND((f."currentAmount" / f."goalAmount" * 100)::numeric, 2) as "% Completado",
    f.status as "Estado",
    f."isPublic" as "Público",
    f.deadline as "Fecha Límite",
    COUNT(DISTINCT p.id) as "Participantes",
    COUNT(DISTINCT c.id) as "Contribuciones",
    COUNT(DISTINCT e.id) as "Gastos"
FROM funds f
JOIN users u ON f."creatorId" = u.id
LEFT JOIN participants p ON f.id = p."fundId" AND p.status = 'JOINED'
LEFT JOIN contributions c ON f.id = c."fundId" AND c.status = 'COMPLETED'
LEFT JOIN expenses e ON f.id = e."fundId"
GROUP BY f.id, f.title, u.name, f."goalAmount", f."currentAmount", f.status, f."isPublic", f.deadline
ORDER BY f."createdAt";

-- Query compleja: Usuarios más activos
SELECT 
    u.name as "Usuario",
    u.email,
    COUNT(DISTINCT f.id) as "Fondos Creados",
    COUNT(DISTINCT p.id) as "Participaciones",
    COUNT(DISTINCT c.id) as "Contribuciones",
    COALESCE(SUM(c.amount), 0) as "Total Contribuido",
    COUNT(DISTINCT e.id) as "Gastos Registrados"
FROM users u
LEFT JOIN funds f ON u.id = f."creatorId"
LEFT JOIN participants p ON u.id = p."userId" AND p.status = 'JOINED'
LEFT JOIN contributions c ON u.id = c."userId" AND c.status = 'COMPLETED'
LEFT JOIN expenses e ON u.id = e."userId"
WHERE u.role = 'USER'
GROUP BY u.id, u.name, u.email
ORDER BY "Total Contribuido" DESC;

-- Query compleja: Estado financiero por fondo
SELECT 
    f.title as "Fondo",
    f."goalAmount" as "Meta",
    COALESCE(SUM(CASE WHEN c.status = 'COMPLETED' THEN c.amount ELSE 0 END), 0) as "Recaudado Real",
    COALESCE(SUM(CASE WHEN e."isApproved" = true THEN e.amount ELSE 0 END), 0) as "Gastos Aprobados",
    (COALESCE(SUM(CASE WHEN c.status = 'COMPLETED' THEN c.amount ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN e."isApproved" = true THEN e.amount ELSE 0 END), 0)) as "Balance",
    f.status as "Estado"
FROM funds f
LEFT JOIN contributions c ON f.id = c."fundId"
LEFT JOIN expenses e ON f.id = e."fundId"
GROUP BY f.id, f.title, f."goalAmount", f.status
ORDER BY "Balance" DESC;

-- =====================================================
-- 8. VERIFICAR INTEGRIDAD REFERENCIAL
-- =====================================================

-- Verificar que no hay registros huérfanos
SELECT 'participants_sin_usuario' as problema, COUNT(*) as cantidad
FROM participants p
LEFT JOIN users u ON p."userId" = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'participants_sin_fondo', COUNT(*)
FROM participants p
LEFT JOIN funds f ON p."fundId" = f.id
WHERE f.id IS NULL
UNION ALL
SELECT 'contributions_sin_usuario', COUNT(*)
FROM contributions c
LEFT JOIN users u ON c."userId" = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'contributions_sin_fondo', COUNT(*)
FROM contributions c
LEFT JOIN funds f ON c."fundId" = f.id
WHERE f.id IS NULL
UNION ALL
SELECT 'expenses_sin_usuario', COUNT(*)
FROM expenses e
LEFT JOIN users u ON e."userId" = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'expenses_sin_fondo', COUNT(*)
FROM expenses e
LEFT JOIN funds f ON e."fundId" = f.id
WHERE f.id IS NULL;

-- =====================================================
-- 9. PERFORMANCE - VERIFICAR QUE LOS ÍNDICES FUNCIONAN
-- =====================================================

-- EXPLAIN para ver si usa índices correctamente
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM funds 
WHERE status = 'ACTIVE' 
  AND "isPublic" = true;

-- EXPLAIN para join complejo
EXPLAIN (ANALYZE, BUFFERS)
SELECT f.title, u.name, COUNT(c.id) as contribuciones
FROM funds f
JOIN users u ON f."creatorId" = u.id
LEFT JOIN contributions c ON f.id = c."fundId"
WHERE f.status = 'ACTIVE'
GROUP BY f.id, f.title, u.name;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
✅ VALIDACIONES QUE DEBEN PASAR:

1. Todas las tablas existen: users, funds, participants, contributions, expenses
2. Todos los enums existen: Role, FundStatus, ParticipantStatus, ContributionStatus, ExpenseCategory  
3. Todas las foreign keys están correctas
4. Todos los índices están creados
5. Las queries complejas funcionan sin errores
6. No hay registros huérfanos (integridad referencial)
7. Los índices se usan correctamente (performance)

Si todo pasa → ✅ SCHEMA VÁLIDO Y FUNCIONAL
Si algo falla → ❌ Necesita corrección
*/