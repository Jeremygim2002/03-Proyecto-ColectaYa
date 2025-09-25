-- =====================================================
-- SCRIPT DE SEEDING PARA COLECTAYA
-- Ejecutar en pgAdmin o cualquier cliente PostgreSQL
-- =====================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM expenses;
-- DELETE FROM contributions;
-- DELETE FROM participants;
-- DELETE FROM funds;
-- DELETE FROM users WHERE email != 'admin@colectaya.com';

-- =====================================================
-- 1. INSERTAR USUARIOS
-- =====================================================

-- Contraseña hasheada para 'password123' con bcrypt (10 rounds)
INSERT INTO users (email, name, password, role, "isActive", "createdAt", "updatedAt") VALUES
('admin@colectaya.com', 'Administrador ColectaYa', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, NOW(), NOW()),
('maria.gonzalez@gmail.com', 'María González', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', true, NOW(), NOW()),
('carlos.rodriguez@hotmail.com', 'Carlos Rodríguez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', true, NOW(), NOW()),
('ana.lopez@outlook.com', 'Ana López', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', true, NOW(), NOW()),
('diego.martinez@gmail.com', 'Diego Martínez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', true, NOW(), NOW()),
('sofia.torres@yahoo.com', 'Sofía Torres', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 2. INSERTAR FONDOS
-- =====================================================

INSERT INTO funds (
    title, description, "goalAmount", "currentAmount", deadline, status, 
    "isPublic", "allowOpenJoin", "maxParticipants", "creatorId", "createdAt", "updatedAt"
) VALUES
-- Fondo 1: Regalo de Cumpleaños (María es creadora - ID 2)
(
    'Regalo de Cumpleaños para Carlos',
    'Estamos juntando dinero para comprarle una bicicleta nueva a Carlos por su cumpleaños número 30. ¡Ayúdanos a hacer su día especial!',
    500.00, 320.50, '2024-12-15'::timestamp, 'ACTIVE'::public."FundStatus",
    true, true, 20, 
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    NOW(), NOW()
),
-- Fondo 2: Viaje Familiar (Carlos es creador - ID 3)
(
    'Viaje Familiar a la Playa',
    'Fondo familiar para costear nuestras vacaciones de verano. Incluye hospedaje, comida y actividades para toda la familia.',
    1200.00, 450.00, '2024-11-30'::timestamp, 'ACTIVE'::public."FundStatus",
    false, false, 6,
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    NOW(), NOW()
),
-- Fondo 3: Emergencia Médica (Ana es creadora - ID 4)
(
    'Emergencia Médica - Operación de Ana',
    'Ana necesita una operación urgente y los gastos médicos son altos. Cualquier ayuda es bienvenida.',
    2000.00, 1150.75, '2024-10-20'::timestamp, 'ACTIVE'::public."FundStatus",
    true, true, NULL,
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    NOW(), NOW()
),
-- Fondo 4: Graduación (Diego es creador - ID 5)
(
    'Graduación Universitaria - Fiesta',
    'Celebración de graduación para los estudiantes de ingeniería. ¡Ya alcanzamos la meta!',
    800.00, 850.00, '2024-09-15'::timestamp, 'COMPLETED'::public."FundStatus",
    false, false, 15,
    (SELECT id FROM users WHERE email = 'diego.martinez@gmail.com'),
    NOW(), NOW()
),
-- Fondo 5: Equipo de Fútbol (Sofía es creadora - ID 6)
(
    'Equipo de Fútbol - Uniformes Nuevos',
    'Necesitamos uniformes nuevos para el equipo de fútbol del barrio. Aún estamos organizando los detalles.',
    600.00, 0.00, NULL, 'DRAFT'::public."FundStatus",
    false, true, 25,
    (SELECT id FROM users WHERE email = 'sofia.torres@yahoo.com'),
    NOW(), NOW()
);

-- =====================================================
-- 3. INSERTAR PARTICIPANTES
-- =====================================================

INSERT INTO participants (
    "userId", "fundId", status, "joinedAt", "canAddExpenses", "canEditFund", "canInviteOthers", "createdAt", "updatedAt"
) VALUES
-- Participantes del fondo de cumpleaños (Fund ID 1)
(
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    'JOINED'::public."ParticipantStatus", '2024-09-01'::timestamp, true, false, false, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    'JOINED'::public."ParticipantStatus", '2024-09-05'::timestamp, false, false, true, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'diego.martinez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    'JOINED'::public."ParticipantStatus", '2024-09-10'::timestamp, false, false, false, NOW(), NOW()
),

-- Participantes del viaje familiar (Fund ID 2)
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    'JOINED'::public."ParticipantStatus", '2024-08-15'::timestamp, true, true, true, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'sofia.torres@yahoo.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    'JOINED'::public."ParticipantStatus", '2024-08-20'::timestamp, true, false, false, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'diego.martinez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    'DECLINED'::public."ParticipantStatus", NULL, false, false, false, NOW(), NOW()
),

-- Participantes del fondo médico (Fund ID 3)
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    'JOINED'::public."ParticipantStatus", '2024-09-01'::timestamp, false, false, true, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    'JOINED'::public."ParticipantStatus", '2024-09-02'::timestamp, false, false, false, NOW(), NOW()
);

-- =====================================================
-- 4. INSERTAR CONTRIBUCIONES
-- =====================================================

INSERT INTO contributions (
    "userId", "fundId", amount, description, status, "paymentId", "paymentMethod", "contributedAt", "createdAt", "updatedAt"
) VALUES
-- Contribuciones al fondo de cumpleaños
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    100.00, 'Mi aporte inicial para el regalo', 'COMPLETED'::public."ContributionStatus",
    'mp_001', 'Tarjeta de Crédito', '2024-09-01'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    75.50, 'Para el regalo de Carlos!', 'COMPLETED'::public."ContributionStatus",
    'mp_002', 'Transferencia', '2024-09-05'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'diego.martinez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    145.00, 'Aporte de Diego', 'COMPLETED'::public."ContributionStatus",
    'mp_003', 'Efectivo', '2024-09-10'::timestamp, NOW(), NOW()
),

-- Contribuciones al viaje familiar
(
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    200.00, 'Inicio del fondo familiar', 'COMPLETED'::public."ContributionStatus",
    'mp_004', 'Tarjeta de Débito', '2024-08-15'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    150.00, 'Para las vacaciones familiares', 'COMPLETED'::public."ContributionStatus",
    'mp_005', 'Transferencia', '2024-08-20'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'sofia.torres@yahoo.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    100.00, 'Mi aporte para el viaje', 'COMPLETED'::public."ContributionStatus",
    'mp_006', 'Tarjeta de Crédito', '2024-08-25'::timestamp, NOW(), NOW()
),

-- Contribuciones al fondo médico
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    300.00, 'Ayuda para la operación de Ana', 'COMPLETED'::public."ContributionStatus",
    'mp_007', 'Transferencia', '2024-09-01'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    250.75, 'Apoyo para Ana', 'COMPLETED'::public."ContributionStatus",
    'mp_008', 'Tarjeta de Crédito', '2024-09-02'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'diego.martinez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    600.00, 'Gran aporte para ayudar a Ana', 'COMPLETED'::public."ContributionStatus",
    'mp_009', 'Transferencia', '2024-09-15'::timestamp, NOW(), NOW()
),

-- Contribución pendiente
(
    (SELECT id FROM users WHERE email = 'sofia.torres@yahoo.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    50.00, 'Ayuda para Ana', 'PENDING'::public."ContributionStatus",
    'mp_010', 'Tarjeta de Crédito', NULL, NOW(), NOW()
);

-- =====================================================
-- 5. INSERTAR GASTOS
-- =====================================================

INSERT INTO expenses (
    "userId", "fundId", title, description, amount, category, "receiptUrl", "isApproved", "expenseDate", "createdAt", "updatedAt"
) VALUES
-- Gastos del fondo de cumpleaños
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    'Cotización Bicicleta Deportiva', 'Cotización en tienda local para bicicleta mountain bike',
    480.00, 'EQUIPMENT'::public."ExpenseCategory", 'https://ejemplo.com/cotizacion-bicicleta.pdf',
    true, '2024-09-08'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Regalo de Cumpleaños para Carlos'),
    'Decoración para la Fiesta', 'Globos, guirnaldas y decoración para la celebración',
    35.50, 'EVENT'::public."ExpenseCategory", 'https://ejemplo.com/recibo-decoracion.jpg',
    true, '2024-09-12'::timestamp, NOW(), NOW()
),

-- Gastos del viaje familiar
(
    (SELECT id FROM users WHERE email = 'carlos.rodriguez@hotmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    'Reserva de Hotel', 'Reserva anticipada del hotel en la playa - 4 noches',
    320.00, 'OTHER'::public."ExpenseCategory", 'https://ejemplo.com/reserva-hotel.pdf',
    true, '2024-08-18'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'maria.gonzalez@gmail.com'),
    (SELECT id FROM funds WHERE title = 'Viaje Familiar a la Playa'),
    'Transporte - Peajes', 'Estimación de peajes para el viaje de ida y vuelta',
    85.00, 'TRANSPORT'::public."ExpenseCategory", NULL,
    false, '2024-09-01'::timestamp, NOW(), NOW()
),

-- Gastos del fondo médico
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    'Consulta con Especialista', 'Consulta preoperatoria con cirujano especialista',
    150.00, 'MEDICAL'::public."ExpenseCategory", 'https://ejemplo.com/recibo-consulta.pdf',
    true, '2024-09-05'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    'Medicamentos Preoperatorios', 'Medicamentos recetados para preparación antes de la cirugía',
    95.50, 'MEDICAL'::public."ExpenseCategory", 'https://ejemplo.com/recibo-farmacia.jpg',
    true, '2024-09-10'::timestamp, NOW(), NOW()
),
(
    (SELECT id FROM users WHERE email = 'ana.lopez@outlook.com'),
    (SELECT id FROM funds WHERE title = 'Emergencia Médica - Operación de Ana'),
    'Estudios Médicos', 'Rayos X y análisis de sangre requeridos',
    120.00, 'MEDICAL'::public."ExpenseCategory", 'https://ejemplo.com/estudios-medicos.pdf',
    true, '2024-09-03'::timestamp, NOW(), NOW()
);

-- =====================================================
-- 6. VERIFICAR DATOS INSERTADOS
-- =====================================================

-- Consulta para verificar todo fue insertado correctamente
SELECT 
    'RESUMEN DE DATOS INSERTADOS' as info,
    (SELECT COUNT(*) FROM users) as usuarios,
    (SELECT COUNT(*) FROM funds) as fondos,
    (SELECT COUNT(*) FROM participants) as participaciones,
    (SELECT COUNT(*) FROM contributions) as contribuciones,
    (SELECT COUNT(*) FROM expenses) as gastos;

-- Consulta para ver fondos con sus montos
SELECT 
    f.title as "Fondo",
    f."goalAmount" as "Meta",
    f."currentAmount" as "Recaudado",
    f.status as "Estado",
    u.name as "Creador"
FROM funds f
JOIN users u ON f."creatorId" = u.id
ORDER BY f."createdAt";

-- =====================================================
-- 7. USUARIOS DE PRUEBA
-- =====================================================

/*
USUARIOS DE PRUEBA CREADOS:

📧 admin@colectaya.com (ADMIN) - Administrador del sistema
📧 maria.gonzalez@gmail.com (USER) - Creadora del fondo de cumpleaños
📧 carlos.rodriguez@hotmail.com (USER) - Creador del fondo familiar  
📧 ana.lopez@outlook.com (USER) - Creadora del fondo médico
📧 diego.martinez@gmail.com (USER) - Creador del fondo completado
📧 sofia.torres@yahoo.com (USER) - Creadora del fondo en borrador

🔐 Contraseña para todos: password123

FONDOS CREADOS:
1. Regalo de Cumpleaños para Carlos ($500 meta, $320.50 recaudado)
2. Viaje Familiar a la Playa ($1200 meta, $450 recaudado)
3. Emergencia Médica - Operación de Ana ($2000 meta, $1150.75 recaudado)
4. Graduación Universitaria - Fiesta (COMPLETADO - $800 meta, $850 recaudado)
5. Equipo de Fútbol - Uniformes Nuevos (BORRADOR - $600 meta, $0 recaudado)
*/