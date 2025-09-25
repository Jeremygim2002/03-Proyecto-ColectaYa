import { PrismaClient, Role, FundStatus, ParticipantStatus, ContributionStatus, ExpenseCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // =====================================================
  // 1. CREAR USUARIOS DE PRUEBA
  // =====================================================
  console.log('👥 Creando usuarios...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    // Administrador del sistema
    prisma.user.upsert({
      where: { email: 'admin@colectaya.com' },
      update: {},
      create: {
        email: 'admin@colectaya.com',
        name: 'Administrador ColectaYa',
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    }),
    // Usuarios regulares
    prisma.user.upsert({
      where: { email: 'maria.gonzalez@gmail.com' },
      update: {},
      create: {
        email: 'maria.gonzalez@gmail.com',
        name: 'María González',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.rodriguez@hotmail.com' },
      update: {},
      create: {
        email: 'carlos.rodriguez@hotmail.com',
        name: 'Carlos Rodríguez',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    }),

    prisma.user.upsert({
      where: { email: 'ana.lopez@outlook.com' },
      update: {},
      create: {
        email: 'ana.lopez@outlook.com',
        name: 'Ana López',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    }),

    prisma.user.upsert({
      where: { email: 'diego.martinez@gmail.com' },
      update: {},
      create: {
        email: 'diego.martinez@gmail.com',
        name: 'Diego Martínez',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    }),

    prisma.user.upsert({
      where: { email: 'sofia.torres@yahoo.com' },
      update: {},
      create: {
        email: 'sofia.torres@yahoo.com',
        name: 'Sofía Torres',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuarios creados`);

  // =====================================================
  // 2. CREAR FONDOS DE EJEMPLO
  // =====================================================

  console.log('💰 Creando fondos...');

  const funds = await Promise.all([
    // Fondo activo público - Regalo de cumpleaños
    prisma.fund.create({
      data: {
        title: 'Regalo de Cumpleaños para Carlos',
        description:
          'Estamos juntando dinero para comprarle una bicicleta nueva a Carlos por su cumpleaños número 30. ¡Ayúdanos a hacer su día especial!',
        goalAmount: 500.0,
        currentAmount: 320.5,
        deadline: new Date('2024-12-15'),
        status: FundStatus.ACTIVE,
        isPublic: true,
        allowOpenJoin: true,
        maxParticipants: 20,
        creatorId: users[1].id,
      },
    }),

    // Fondo privado - Viaje familiar
    prisma.fund.create({
      data: {
        title: 'Viaje Familiar a la Playa',
        description:
          'Fondo familiar para costear nuestras vacaciones de verano. Incluye hospedaje, comida y actividades para toda la familia.',
        goalAmount: 1200.0,
        currentAmount: 450.0,
        deadline: new Date('2024-11-30'),
        status: FundStatus.ACTIVE,
        isPublic: false,
        allowOpenJoin: false,
        maxParticipants: 6,
        creatorId: users[2].id, // Carlos Rodríguez
      },
    }),

    // Fondo de emergencia médica
    prisma.fund.create({
      data: {
        title: 'Emergencia Médica - Operación de Ana',
        description:
          'Ana necesita una operación urgente y los gastos médicos son altos. Cualquier ayuda es bienvenida.',
        goalAmount: 2000.0,
        currentAmount: 1150.75,
        deadline: new Date('2024-10-20'),
        status: FundStatus.ACTIVE,
        isPublic: true,
        allowOpenJoin: true,
        creatorId: users[3].id, // Ana López
      },
    }),

    // Fondo completado - Evento universitario
    prisma.fund.create({
      data: {
        title: 'Graduación Universitaria - Fiesta',
        description: 'Celebración de graduación para los estudiantes de ingeniería. ¡Ya alcanzamos la meta!',
        goalAmount: 800.0,
        currentAmount: 850.0,
        deadline: new Date('2024-09-15'),
        status: FundStatus.COMPLETED,
        isPublic: false,
        allowOpenJoin: false,
        maxParticipants: 15,
        creatorId: users[4].id, // Diego Martínez
      },
    }),

    // Fondo en borrador
    prisma.fund.create({
      data: {
        title: 'Equipo de Fútbol - Uniformes Nuevos',
        description:
          'Necesitamos uniformes nuevos para el equipo de fútbol del barrio. Aún estamos organizando los detalles.',
        goalAmount: 600.0,
        currentAmount: 0.0,
        status: FundStatus.DRAFT,
        isPublic: false,
        allowOpenJoin: true,
        maxParticipants: 25,
        creatorId: users[5].id, // Sofía Torres
      },
    }),
  ]);

  console.log(`✅ ${funds.length} fondos creados`);

  // =====================================================
  // 3. CREAR PARTICIPANTES
  // =====================================================

  console.log('🤝 Creando participaciones...');

  const participants = await Promise.all([
    // Participantes del fondo de cumpleaños de Carlos
    prisma.participant.create({
      data: {
        userId: users[2].id, // Carlos (el homenajeado)
        fundId: funds[0].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-09-01'),
        canAddExpenses: true,
        canEditFund: false,
        canInviteOthers: false,
      },
    }),
    prisma.participant.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[0].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-09-05'),
        canAddExpenses: false,
        canEditFund: false,
        canInviteOthers: true,
      },
    }),
    prisma.participant.create({
      data: {
        userId: users[4].id, // Diego
        fundId: funds[0].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-09-10'),
        canAddExpenses: false,
        canEditFund: false,
        canInviteOthers: false,
      },
    }),

    // Participantes del viaje familiar
    prisma.participant.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[1].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-08-15'),
        canAddExpenses: true,
        canEditFund: true,
        canInviteOthers: true,
      },
    }),
    prisma.participant.create({
      data: {
        userId: users[5].id, // Sofía
        fundId: funds[1].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-08-20'),
        canAddExpenses: true,
        canEditFund: false,
        canInviteOthers: false,
      },
    }),

    // Participantes del fondo médico
    prisma.participant.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[2].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-09-01'),
        canAddExpenses: false,
        canEditFund: false,
        canInviteOthers: true,
      },
    }),
    prisma.participant.create({
      data: {
        userId: users[2].id, // Carlos
        fundId: funds[2].id,
        status: ParticipantStatus.JOINED,
        joinedAt: new Date('2024-09-02'),
        canAddExpenses: false,
        canEditFund: false,
        canInviteOthers: false,
      },
    }),

    // Participante que declinó invitación
    prisma.participant.create({
      data: {
        userId: users[4].id, // Diego
        fundId: funds[1].id,
        status: ParticipantStatus.DECLINED,
        canAddExpenses: false,
        canEditFund: false,
        canInviteOthers: false,
      },
    }),
  ]);

  console.log(`✅ ${participants.length} participaciones creadas`);

  // =====================================================
  // 4. CREAR CONTRIBUCIONES
  // =====================================================

  console.log('💵 Creando contribuciones...');

  const contributions = await Promise.all([
    // Contribuciones al fondo de cumpleaños
    prisma.contribution.create({
      data: {
        userId: users[1].id, // María (creadora)
        fundId: funds[0].id,
        amount: 100.0,
        description: 'Mi aporte inicial para el regalo',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_001',
        paymentMethod: 'Tarjeta de Crédito',
        contributedAt: new Date('2024-09-01'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[0].id,
        amount: 75.5,
        description: 'Para el regalo de Carlos!',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_002',
        paymentMethod: 'Transferencia',
        contributedAt: new Date('2024-09-05'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[4].id, // Diego
        fundId: funds[0].id,
        amount: 145.0,
        description: 'Aporte de Diego',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_003',
        paymentMethod: 'Efectivo',
        contributedAt: new Date('2024-09-10'),
      },
    }),

    // Contribuciones al viaje familiar
    prisma.contribution.create({
      data: {
        userId: users[2].id, // Carlos (creador)
        fundId: funds[1].id,
        amount: 200.0,
        description: 'Inicio del fondo familiar',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_004',
        paymentMethod: 'Tarjeta de Débito',
        contributedAt: new Date('2024-08-15'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[1].id,
        amount: 150.0,
        description: 'Para las vacaciones familiares',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_005',
        paymentMethod: 'Transferencia',
        contributedAt: new Date('2024-08-20'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[5].id, // Sofía
        fundId: funds[1].id,
        amount: 100.0,
        description: 'Mi aporte para el viaje',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_006',
        paymentMethod: 'Tarjeta de Crédito',
        contributedAt: new Date('2024-08-25'),
      },
    }),

    // Contribuciones al fondo médico
    prisma.contribution.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[2].id,
        amount: 300.0,
        description: 'Ayuda para la operación de Ana',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_007',
        paymentMethod: 'Transferencia',
        contributedAt: new Date('2024-09-01'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[2].id, // Carlos
        fundId: funds[2].id,
        amount: 250.75,
        description: 'Apoyo para Ana',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_008',
        paymentMethod: 'Tarjeta de Crédito',
        contributedAt: new Date('2024-09-02'),
      },
    }),
    prisma.contribution.create({
      data: {
        userId: users[4].id, // Diego
        fundId: funds[2].id,
        amount: 600.0,
        description: 'Gran aporte para ayudar a Ana',
        status: ContributionStatus.COMPLETED,
        paymentId: 'mp_009',
        paymentMethod: 'Transferencia',
        contributedAt: new Date('2024-09-15'),
      },
    }),

    // Contribución pendiente
    prisma.contribution.create({
      data: {
        userId: users[5].id, // Sofía
        fundId: funds[2].id,
        amount: 50.0,
        description: 'Ayuda para Ana',
        status: ContributionStatus.PENDING,
        paymentId: 'mp_010',
        paymentMethod: 'Tarjeta de Crédito',
      },
    }),
  ]);

  console.log(`✅ ${contributions.length} contribuciones creadas`);

  // =====================================================
  // 5. CREAR GASTOS/EXPENSES
  // =====================================================

  console.log('🧾 Creando gastos...');

  const expenses = await Promise.all([
    // Gastos del fondo de cumpleaños
    prisma.expense.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[0].id,
        title: 'Cotización Bicicleta Deportiva',
        description: 'Cotización en tienda local para bicicleta mountain bike',
        amount: 480.0,
        category: ExpenseCategory.EQUIPMENT,
        receiptUrl: 'https://ejemplo.com/cotizacion-bicicleta.pdf',
        isApproved: true,
        expenseDate: new Date('2024-09-08'),
      },
    }),
    prisma.expense.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[0].id,
        title: 'Decoración para la Fiesta',
        description: 'Globos, guirnaldas y decoración para la celebración',
        amount: 35.5,
        category: ExpenseCategory.EVENT,
        receiptUrl: 'https://ejemplo.com/recibo-decoracion.jpg',
        isApproved: true,
        expenseDate: new Date('2024-09-12'),
      },
    }),

    // Gastos del viaje familiar
    prisma.expense.create({
      data: {
        userId: users[2].id, // Carlos
        fundId: funds[1].id,
        title: 'Reserva de Hotel',
        description: 'Reserva anticipada del hotel en la playa - 4 noches',
        amount: 320.0,
        category: ExpenseCategory.OTHER,
        receiptUrl: 'https://ejemplo.com/reserva-hotel.pdf',
        isApproved: true,
        expenseDate: new Date('2024-08-18'),
      },
    }),
    prisma.expense.create({
      data: {
        userId: users[1].id, // María
        fundId: funds[1].id,
        title: 'Transporte - Peajes',
        description: 'Estimación de peajes para el viaje de ida y vuelta',
        amount: 85.0,
        category: ExpenseCategory.TRANSPORT,
        isApproved: false, // Pendiente de aprobación
        expenseDate: new Date('2024-09-01'),
      },
    }),

    // Gastos del fondo médico
    prisma.expense.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[2].id,
        title: 'Consulta con Especialista',
        description: 'Consulta preoperatoria con cirujano especialista',
        amount: 150.0,
        category: ExpenseCategory.MEDICAL,
        receiptUrl: 'https://ejemplo.com/recibo-consulta.pdf',
        isApproved: true,
        expenseDate: new Date('2024-09-05'),
      },
    }),
    prisma.expense.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[2].id,
        title: 'Medicamentos Preoperatorios',
        description: 'Medicamentos recetados para preparación antes de la cirugía',
        amount: 95.5,
        category: ExpenseCategory.MEDICAL,
        receiptUrl: 'https://ejemplo.com/recibo-farmacia.jpg',
        isApproved: true,
        expenseDate: new Date('2024-09-10'),
      },
    }),
    prisma.expense.create({
      data: {
        userId: users[3].id, // Ana
        fundId: funds[2].id,
        title: 'Estudios Médicos',
        description: 'Rayos X y análisis de sangre requeridos',
        amount: 120.0,
        category: ExpenseCategory.MEDICAL,
        receiptUrl: 'https://ejemplo.com/estudios-medicos.pdf',
        isApproved: true,
        expenseDate: new Date('2024-09-03'),
      },
    }),
  ]);

  console.log(`✅ ${expenses.length} gastos creados`);

  // =====================================================
  // 6. ACTUALIZAR CURRENT_AMOUNT DE LOS FONDOS
  // =====================================================

  console.log('🔄 Actualizando montos actuales de fondos...');

  // Actualizar fondo de cumpleaños
  await prisma.fund.update({
    where: { id: funds[0].id },
    data: { currentAmount: 320.5 }, // Sum of contributions: 100 + 75.50 + 145
  });

  // Actualizar fondo de viaje
  await prisma.fund.update({
    where: { id: funds[1].id },
    data: { currentAmount: 450.0 }, // Sum of contributions: 200 + 150 + 100
  });

  // Actualizar fondo médico
  await prisma.fund.update({
    where: { id: funds[2].id },
    data: { currentAmount: 1150.75 }, // Sum: 300 + 250.75 + 600 (pending contribution not counted)
  });

  console.log('✅ Montos actualizados');

  console.log('\n🎉 ¡Seeding completado exitosamente!');
  console.log('\n📊 RESUMEN DE DATOS CREADOS:');
  console.log(`  👥 Usuarios: ${users.length}`);
  console.log(`  💰 Fondos: ${funds.length}`);
  console.log(`  🤝 Participaciones: ${participants.length}`);
  console.log(`  💵 Contribuciones: ${contributions.length}`);
  console.log(`  🧾 Gastos: ${expenses.length}`);
  console.log('\n🔑 USUARIOS DE PRUEBA:');
  console.log('  📧 admin@colectaya.com (ADMIN)');
  console.log('  📧 maria.gonzalez@gmail.com (USER)');
  console.log('  📧 carlos.rodriguez@hotmail.com (USER)');
  console.log('  📧 ana.lopez@outlook.com (USER)');
  console.log('  📧 diego.martinez@gmail.com (USER)');
  console.log('  📧 sofia.torres@yahoo.com (USER)');
  console.log('  🔐 Contraseña para todos: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
