// Central Mock Data - All entities
import {
  Person, PersonType, RiskLevel,
  Loan, LoanStatus, LoanRequest, LoanRequestStatus, LoanGuarantor,
  Saving, SavingStatus, SavingType,
  Donation, DonationType, DonationStatus,
  PayLine, PayLineStatus, PayHeader, PayType, PayEntityType,
  GLAccount, GLAccountType, GLAccountCategory, GLTransaction,
  Activity, ActivityType, ActivityStatus, ActivityEntityType,
  Document, DocumentType, FileUpload, FileCategory,
  User, UserRole,
  Lov, LovType,
  MasavHeader, MasavStatus, MasavType,
  PaymentMethodType
} from '../../models';

// ============ HELPER FUNCTIONS ============

const generateId = (() => {
  let id = 1000;
  return () => ++id;
})();

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ============ LOV DATA ============

export const IDENTITY_TYPES: Lov[] = [
  { id: 58, code: 'ID_CARD', name: 'תעודת זהות', lovType: 'IDENTITY_TYPE', displayOrder: 1, isDefault: true, isActive: true, isSystem: true },
  { id: 59, code: 'PASSPORT', name: 'דרכון', lovType: 'IDENTITY_TYPE', displayOrder: 2, isDefault: false, isActive: true, isSystem: true },
  { id: 60, code: 'MILITARY_ID', name: 'תעודת חוגר', lovType: 'IDENTITY_TYPE', displayOrder: 3, isDefault: false, isActive: true, isSystem: false },
];

export const TITLES: Lov[] = [
  { id: 1, code: 'MR', name: 'מר', lovType: 'TITLE', displayOrder: 1, isDefault: true, isActive: true, isSystem: true },
  { id: 2, code: 'MRS', name: 'גב\'', lovType: 'TITLE', displayOrder: 2, isDefault: false, isActive: true, isSystem: true },
  { id: 3, code: 'RABBI', name: 'הרב', lovType: 'TITLE', displayOrder: 3, isDefault: false, isActive: true, isSystem: true },
  { id: 4, code: 'DR', name: 'ד"ר', lovType: 'TITLE', displayOrder: 4, isDefault: false, isActive: true, isSystem: false },
];

export const CITIES: Lov[] = [
  { id: 1, code: 'JERUSALEM', name: 'ירושלים', lovType: 'CITY', displayOrder: 1, isDefault: true, isActive: true, isSystem: true },
  { id: 2, code: 'TEL_AVIV', name: 'תל אביב', lovType: 'CITY', displayOrder: 2, isDefault: false, isActive: true, isSystem: true },
  { id: 3, code: 'HAIFA', name: 'חיפה', lovType: 'CITY', displayOrder: 3, isDefault: false, isActive: true, isSystem: true },
  { id: 4, code: 'BNEI_BRAK', name: 'בני ברק', lovType: 'CITY', displayOrder: 4, isDefault: false, isActive: true, isSystem: true },
  { id: 5, code: 'BEER_SHEVA', name: 'באר שבע', lovType: 'CITY', displayOrder: 5, isDefault: false, isActive: true, isSystem: true },
  { id: 6, code: 'PETAH_TIKVA', name: 'פתח תקווה', lovType: 'CITY', displayOrder: 6, isDefault: false, isActive: true, isSystem: false },
  { id: 7, code: 'ASHDOD', name: 'אשדוד', lovType: 'CITY', displayOrder: 7, isDefault: false, isActive: true, isSystem: false },
  { id: 8, code: 'NETANYA', name: 'נתניה', lovType: 'CITY', displayOrder: 8, isDefault: false, isActive: true, isSystem: false },
  { id: 9, code: 'MODIIN', name: 'מודיעין', lovType: 'CITY', displayOrder: 9, isDefault: false, isActive: true, isSystem: false },
  { id: 10, code: 'RAMAT_GAN', name: 'רמת גן', lovType: 'CITY', displayOrder: 10, isDefault: false, isActive: true, isSystem: false },
];

export const BANKS: Lov[] = [
  { id: 10, code: 'LEUMI', name: 'בנק לאומי', lovType: 'BANK', displayOrder: 1, isDefault: false, isActive: true, isSystem: true, additionalData: { swiftCode: 'LUMIILITXXX' } },
  { id: 11, code: 'DISCOUNT', name: 'בנק דיסקונט', lovType: 'BANK', displayOrder: 2, isDefault: false, isActive: true, isSystem: true, additionalData: { swiftCode: 'BARIKIW' } },
  { id: 12, code: 'HAPOALIM', name: 'בנק הפועלים', lovType: 'BANK', displayOrder: 3, isDefault: true, isActive: true, isSystem: true, additionalData: { swiftCode: 'POABORX' } },
  { id: 13, code: 'MIZRAHI', name: 'בנק מזרחי טפחות', lovType: 'BANK', displayOrder: 4, isDefault: false, isActive: true, isSystem: true, additionalData: { swiftCode: 'MIZBILIT' } },
  { id: 14, code: 'MERCANTILE', name: 'בנק מרכנתיל', lovType: 'BANK', displayOrder: 5, isDefault: false, isActive: true, isSystem: true },
  { id: 17, code: 'IGUD', name: 'בנק איגוד', lovType: 'BANK', displayOrder: 6, isDefault: false, isActive: true, isSystem: true },
  { id: 20, code: 'FIBI', name: 'הבנק הבינלאומי', lovType: 'BANK', displayOrder: 7, isDefault: false, isActive: true, isSystem: true },
  { id: 31, code: 'YAHAV', name: 'בנק יהב', lovType: 'BANK', displayOrder: 8, isDefault: false, isActive: true, isSystem: true },
  { id: 46, code: 'MASSAD', name: 'בנק מסד', lovType: 'BANK', displayOrder: 9, isDefault: false, isActive: true, isSystem: true },
  { id: 54, code: 'POST', name: 'בנק הדואר', lovType: 'BANK', displayOrder: 10, isDefault: false, isActive: true, isSystem: true },
];

export const LOAN_PURPOSES: Lov[] = [
  { id: 1, code: 'WEDDING', name: 'חתונה', lovType: 'LOAN_PURPOSE', displayOrder: 1, isDefault: true, isActive: true, isSystem: true },
  { id: 2, code: 'MEDICAL', name: 'רפואי', lovType: 'LOAN_PURPOSE', displayOrder: 2, isDefault: false, isActive: true, isSystem: true },
  { id: 3, code: 'HOUSING', name: 'דיור', lovType: 'LOAN_PURPOSE', displayOrder: 3, isDefault: false, isActive: true, isSystem: true },
  { id: 4, code: 'EDUCATION', name: 'חינוך', lovType: 'LOAN_PURPOSE', displayOrder: 4, isDefault: false, isActive: true, isSystem: true },
  { id: 5, code: 'BUSINESS', name: 'עסקי', lovType: 'LOAN_PURPOSE', displayOrder: 5, isDefault: false, isActive: true, isSystem: true },
  { id: 6, code: 'DEBT_CONSOLIDATION', name: 'איחוד חובות', lovType: 'LOAN_PURPOSE', displayOrder: 6, isDefault: false, isActive: true, isSystem: true },
  { id: 7, code: 'OTHER', name: 'אחר', lovType: 'LOAN_PURPOSE', displayOrder: 99, isDefault: false, isActive: true, isSystem: true },
];

export const ACTIVITY_TYPES: Lov[] = [
  { id: 1, code: 'PHONE_CALL', name: 'שיחת טלפון', lovType: 'ACTIVITY_TYPE', displayOrder: 1, isDefault: true, isActive: true, isSystem: true },
  { id: 2, code: 'MEETING', name: 'פגישה', lovType: 'ACTIVITY_TYPE', displayOrder: 2, isDefault: false, isActive: true, isSystem: true },
  { id: 3, code: 'SEND_EMAIL', name: 'שליחת מייל', lovType: 'ACTIVITY_TYPE', displayOrder: 3, isDefault: false, isActive: true, isSystem: true },
  { id: 4, code: 'INTERVIEW_INVITATION', name: 'הזמנה לראיון', lovType: 'ACTIVITY_TYPE', displayOrder: 4, isDefault: false, isActive: true, isSystem: true },
  { id: 5, code: 'DOCUMENT_REQUEST', name: 'בקשת מסמכים', lovType: 'ACTIVITY_TYPE', displayOrder: 5, isDefault: false, isActive: true, isSystem: true },
];

// ============ PERSONS DATA ============

export const MOCK_PERSONS: Person[] = [
  {
    id: 1,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: '123456782',
    title: 3,
    titleName: 'הרב',
    firstName: 'יעקב',
    lastName: 'כהן',
    fullName: 'הרב יעקב כהן',
    address: {
      street: 'הרצל',
      houseNumber: '15',
      apartment: '3',
      city: 1,
      cityName: 'ירושלים',
    },
    contact: {
      mobilePhone: '0501234567',
      phone: '025551234',
      email: 'yaakov@example.com',
    },
    bankAccounts: [
      { bankId: 12, bankName: 'בנק הפועלים', branchNumber: '123', accountNumber: '456789', accountName: 'יעקב כהן' }
    ],
    profession: 'מלמד',
    personType: ['BORROWER', 'DEPOSITOR'],
    canBeGuarantor: true,
    canDeposit: true,
    isContactActive: true,
    riskLevel: 'LOW',
    institutionId: 1,
    totalLoans: 25000,
    totalDeposits: 15000,
    activeLoansCount: 1,
    activeDepositsCount: 1,
    isActive: true,
    createdAt: new Date('2020-01-15'),
  },
  {
    id: 2,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: '234567891',
    title: 1,
    titleName: 'מר',
    firstName: 'משה',
    lastName: 'לוי',
    fullName: 'מר משה לוי',
    address: {
      street: 'ויצמן',
      houseNumber: '42',
      city: 4,
      cityName: 'בני ברק',
    },
    contact: {
      mobilePhone: '0529876543',
      email: 'moshe.levi@example.com',
    },
    bankAccounts: [
      { bankId: 10, bankName: 'בנק לאומי', branchNumber: '456', accountNumber: '123456', accountName: 'משה לוי' }
    ],
    profession: 'סוחר',
    personType: ['BORROWER'],
    canBeGuarantor: true,
    canDeposit: true,
    isContactActive: true,
    riskLevel: 'MEDIUM',
    institutionId: 1,
    totalLoans: 50000,
    activeLoansCount: 2,
    isActive: true,
    createdAt: new Date('2019-06-20'),
  },
  {
    id: 3,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: '345678912',
    title: 2,
    titleName: 'גב\'',
    firstName: 'שרה',
    lastName: 'אברהם',
    fullName: 'גב\' שרה אברהם',
    address: {
      street: 'בן גוריון',
      houseNumber: '8',
      apartment: '12',
      city: 2,
      cityName: 'תל אביב',
    },
    contact: {
      mobilePhone: '0541112233',
      phone: '036665544',
      email: 'sara.a@example.com',
    },
    bankAccounts: [
      { bankId: 13, bankName: 'בנק מזרחי טפחות', branchNumber: '789', accountNumber: '987654', accountName: 'שרה אברהם' }
    ],
    profession: 'רואת חשבון',
    personType: ['DEPOSITOR', 'DONOR'],
    canBeGuarantor: true,
    canDeposit: true,
    isContactActive: true,
    riskLevel: 'LOW',
    institutionId: 1,
    totalDeposits: 100000,
    totalDonations: 5000,
    activeDepositsCount: 2,
    isActive: true,
    createdAt: new Date('2018-03-10'),
  },
  {
    id: 4,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: '456789123',
    title: 3,
    titleName: 'הרב',
    firstName: 'דוד',
    lastName: 'מזרחי',
    fullName: 'הרב דוד מזרחי',
    address: {
      street: 'רבי עקיבא',
      houseNumber: '100',
      city: 4,
      cityName: 'בני ברק',
    },
    contact: {
      mobilePhone: '0587778899',
      email: 'david.m@example.com',
    },
    bankAccounts: [
      { bankId: 12, bankName: 'בנק הפועלים', branchNumber: '321', accountNumber: '654321', accountName: 'דוד מזרחי' }
    ],
    profession: 'ראש כולל',
    personType: ['BORROWER', 'GUARANTOR'],
    canBeGuarantor: true,
    canDeposit: true,
    isContactActive: true,
    riskLevel: 'LOW',
    institutionId: 1,
    totalLoans: 30000,
    activeLoansCount: 1,
    isActive: true,
    createdAt: new Date('2021-07-01'),
  },
  {
    id: 5,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: '567891234',
    title: 1,
    titleName: 'מר',
    firstName: 'אברהם',
    lastName: 'גולדשטיין',
    fullName: 'מר אברהם גולדשטיין',
    address: {
      street: 'הנביאים',
      houseNumber: '25',
      city: 1,
      cityName: 'ירושלים',
    },
    contact: {
      mobilePhone: '0503334455',
      email: 'avraham.g@example.com',
    },
    bankAccounts: [
      { bankId: 11, bankName: 'בנק דיסקונט', branchNumber: '555', accountNumber: '111222', accountName: 'אברהם גולדשטיין' }
    ],
    profession: 'עורך דין',
    personType: ['DONOR', 'DEPOSITOR'],
    canBeGuarantor: true,
    canDeposit: true,
    isContactActive: true,
    riskLevel: 'LOW',
    institutionId: 1,
    totalDeposits: 250000,
    totalDonations: 50000,
    activeDepositsCount: 3,
    isActive: true,
    createdAt: new Date('2017-11-20'),
  },
];

// Generate more persons
for (let i = 6; i <= 50; i++) {
  const firstNames = ['יוסף', 'חיים', 'שלמה', 'מאיר', 'נתן', 'אליהו', 'בנימין', 'יצחק', 'רפאל', 'עמנואל'];
  const lastNames = ['פרידמן', 'רוזנברג', 'שפירא', 'ברגר', 'שטרן', 'קליין', 'גרוס', 'וייס', 'שוורץ', 'זילברשטיין'];

  MOCK_PERSONS.push({
    id: i,
    identityType: 58,
    identityTypeName: 'תעודת זהות',
    identityNumber: String(100000000 + i * 11111111).slice(0, 9),
    title: randomItem([1, 2, 3]),
    firstName: randomItem(firstNames),
    lastName: randomItem(lastNames),
    address: {
      street: randomItem(['הרצל', 'בן יהודה', 'אלנבי', 'דיזנגוף', 'רוטשילד']),
      houseNumber: String(Math.floor(Math.random() * 100) + 1),
      city: randomItem([1, 2, 3, 4, 5]),
    },
    contact: {
      mobilePhone: '05' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0'),
      email: `user${i}@example.com`,
    },
    bankAccounts: [],
    personType: randomItem([['BORROWER'], ['DEPOSITOR'], ['BORROWER', 'DEPOSITOR'], ['DONOR']]) as PersonType[],
    canBeGuarantor: Math.random() > 0.3,
    canDeposit: true,
    isContactActive: Math.random() > 0.1,
    riskLevel: randomItem(['LOW', 'MEDIUM', 'HIGH']) as RiskLevel,
    institutionId: 1,
    isActive: true,
    createdAt: randomDate(new Date('2018-01-01'), new Date('2024-01-01')),
  });
}

// ============ LOANS DATA ============

export const MOCK_LOANS: Loan[] = [
  {
    id: 1,
    loanNumber: 'L-2024-001',
    loanRequestId: 1,
    personId: 1,
    loanAmount: 25000,
    currentBalance: 18750,
    totalPaid: 6250,
    numberOfPayments: 24,
    paymentDay: 15,
    interestRate: 0,
    monthlyPayment: 1041.67,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2026-01-15'),
    nextPaymentDate: new Date('2024-12-15'),
    lastPaymentDate: new Date('2024-10-15'),
    status: 'ACTIVE',
    statusName: 'פעיל',
    paymentMethod: 'MASAV',
    masavActive: true,
    masavCode: 'M001',
    bankAccount: { bankId: 12, branchNumber: '123', accountNumber: '456789', accountName: 'יעקב כהן' },
    guarantors: [],
    paidPaymentsCount: 6,
    remainingPaymentsCount: 18,
    overduePaymentsCount: 0,
    overdueAmount: 0,
    isActive: true,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 2,
    loanNumber: 'L-2024-002',
    loanRequestId: 2,
    personId: 2,
    loanAmount: 50000,
    currentBalance: 45000,
    totalPaid: 5000,
    numberOfPayments: 36,
    paymentDay: 1,
    interestRate: 0,
    monthlyPayment: 1388.89,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2027-03-01'),
    nextPaymentDate: new Date('2024-11-01'),
    lastPaymentDate: new Date('2024-10-01'),
    status: 'ACTIVE',
    statusName: 'פעיל',
    paymentMethod: 'CHECK',
    masavActive: false,
    bankAccount: { bankId: 10, branchNumber: '456', accountNumber: '123456', accountName: 'משה לוי' },
    guarantors: [],
    paidPaymentsCount: 3,
    remainingPaymentsCount: 33,
    overduePaymentsCount: 1,
    overdueAmount: 1388.89,
    isActive: true,
    createdAt: new Date('2024-02-25'),
  },
  {
    id: 3,
    loanNumber: 'L-2023-015',
    personId: 4,
    loanAmount: 30000,
    currentBalance: 10000,
    totalPaid: 20000,
    numberOfPayments: 24,
    paymentDay: 1,
    interestRate: 0,
    monthlyPayment: 1250,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2025-06-01'),
    nextPaymentDate: new Date('2024-11-01'),
    lastPaymentDate: new Date('2024-10-01'),
    status: 'ACTIVE',
    statusName: 'פעיל',
    paymentMethod: 'MASAV',
    masavActive: true,
    bankAccount: { bankId: 12, branchNumber: '321', accountNumber: '654321', accountName: 'דוד מזרחי' },
    guarantors: [],
    paidPaymentsCount: 16,
    remainingPaymentsCount: 8,
    overduePaymentsCount: 0,
    overdueAmount: 0,
    isActive: true,
    createdAt: new Date('2023-05-20'),
  },
];

// Generate more loans
for (let i = 4; i <= 30; i++) {
  const amount = randomItem([10000, 15000, 20000, 25000, 30000, 40000, 50000]);
  const numPayments = randomItem([12, 18, 24, 36]);
  const paymentDay = randomItem([1, 5, 10, 15, 20, 25]);
  const startDate = randomDate(new Date('2022-01-01'), new Date('2024-06-01'));
  const paidMonths = Math.floor((new Date().getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
  const paid = Math.min(paidMonths, numPayments);
  const overdueCount = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;

  MOCK_LOANS.push({
    id: i,
    loanNumber: `L-${startDate.getFullYear()}-${String(i).padStart(3, '0')}`,
    personId: randomItem(MOCK_PERSONS.filter(p => p.personType.includes('BORROWER'))).id,
    loanAmount: amount,
    currentBalance: Math.max(0, amount - (amount / numPayments * paid)),
    totalPaid: amount / numPayments * paid,
    numberOfPayments: numPayments,
    paymentDay: paymentDay,
    interestRate: 0,
    monthlyPayment: amount / numPayments,
    startDate,
    endDate: new Date(startDate.getTime() + numPayments * 30 * 24 * 60 * 60 * 1000),
    status: paid >= numPayments ? 'COMPLETED' : 'ACTIVE',
    paymentMethod: randomItem(['MASAV', 'CHECK', 'BANK_TRANSFER']) as PaymentMethodType,
    masavActive: Math.random() > 0.4,
    guarantors: [],
    paidPaymentsCount: paid,
    remainingPaymentsCount: Math.max(0, numPayments - paid),
    overduePaymentsCount: overdueCount,
    overdueAmount: 0,
    isActive: true,
    createdAt: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
  });
}

// ============ LOAN REQUESTS DATA ============

export const MOCK_LOAN_REQUESTS: LoanRequest[] = [
  {
    id: 1,
    requestNumber: 'LR-2024-001',
    serialNumber: 1001,
    personId: 1,
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 1,
    purposeName: 'חתונה',
    bankAccount: { bankId: 12, branchNumber: '123', accountNumber: '456789', accountName: 'יעקב כהן' },
    guarantors: [],
    status: 'CONVERTED_TO_LOAN',
    statusName: 'הומר להלוואה',
    requestDate: new Date('2024-01-05'),
    approvalDate: new Date('2024-01-10'),
    registrationFeeAmount: 100,
    registrationFeePaid: true,
    registrationFeePaymentDate: new Date('2024-01-05'),
    documentsComplete: true,
    isOnlineRequest: false,
    isActive: true,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 2,
    requestNumber: 'LR-2024-010',
    serialNumber: 1010,
    personId: 6,
    requestedAmount: 35000,
    purpose: 2,
    purposeName: 'רפואי',
    bankAccount: { bankId: 12, branchNumber: '100', accountNumber: '999888', accountName: 'יוסף פרידמן' },
    guarantors: [
      { id: 1, firstName: 'חיים', lastName: 'רוזנברג', identityType: 58, identityNumber: '111222333', phone: '0501112233', email: 'chaim@example.com', isSaved: true, isVerified: false },
      { id: 2, firstName: 'שלמה', lastName: 'שפירא', identityType: 58, identityNumber: '222333444', phone: '0502223344', email: 'shlomo@example.com', isSaved: true, isVerified: false },
    ],
    status: 'PENDING_APPROVAL',
    statusName: 'ממתין לאישור',
    requestDate: new Date('2024-10-01'),
    registrationFeeAmount: 100,
    registrationFeePaid: true,
    registrationFeePaymentDate: new Date('2024-10-01'),
    documentsComplete: true,
    isOnlineRequest: true,
    isActive: true,
    createdAt: new Date('2024-10-01'),
  },
  {
    id: 3,
    requestNumber: 'LR-2024-011',
    serialNumber: 1011,
    personId: 7,
    requestedAmount: 20000,
    purpose: 4,
    purposeName: 'חינוך',
    bankAccount: { bankId: 10, branchNumber: '200', accountNumber: '777666', accountName: 'מאיר ברגר' },
    guarantors: [],
    status: 'PENDING_GUARANTORS',
    statusName: 'ממתין לערבים',
    requestDate: new Date('2024-10-10'),
    registrationFeeAmount: 100,
    registrationFeePaid: false,
    documentsComplete: false,
    isOnlineRequest: true,
    isActive: true,
    createdAt: new Date('2024-10-10'),
  },
  {
    id: 4,
    requestNumber: 'LR-2024-012',
    serialNumber: 1012,
    personId: 8,
    requestedAmount: 45000,
    purpose: 3,
    purposeName: 'דיור',
    bankAccount: { bankId: 13, branchNumber: '300', accountNumber: '555444', accountName: 'נתן שטרן' },
    guarantors: [
      { id: 3, firstName: 'בנימין', lastName: 'קליין', identityType: 58, identityNumber: '333444555', phone: '0503334455', email: 'benny@example.com', isSaved: true, isVerified: true },
    ],
    status: 'PENDING_INTERVIEW',
    statusName: 'ממתין לראיון',
    requestDate: new Date('2024-10-05'),
    interviewDate: new Date('2024-10-20'),
    registrationFeeAmount: 100,
    registrationFeePaid: true,
    documentsComplete: true,
    isOnlineRequest: false,
    isActive: true,
    createdAt: new Date('2024-10-05'),
  },
];

// Generate more loan requests
for (let i = 5; i <= 25; i++) {
  const requestDate = randomDate(new Date('2024-01-01'), new Date('2024-10-15'));
  MOCK_LOAN_REQUESTS.push({
    id: i,
    requestNumber: `LR-2024-${String(i + 10).padStart(3, '0')}`,
    serialNumber: 1000 + i + 10,
    personId: randomItem(MOCK_PERSONS).id,
    requestedAmount: randomItem([10000, 15000, 20000, 25000, 30000, 40000, 50000]),
    purpose: randomItem([1, 2, 3, 4, 5, 6, 7]),
    bankAccount: { bankId: randomItem([10, 11, 12, 13]), branchNumber: String(Math.floor(Math.random() * 900) + 100), accountNumber: String(Math.floor(Math.random() * 900000) + 100000), accountName: 'חשבון' },
    guarantors: [],
    status: randomItem(['PENDING_DOCUMENTS', 'PENDING_INTERVIEW', 'PENDING_GUARANTORS', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']) as LoanRequestStatus,
    requestDate,
    registrationFeeAmount: 100,
    registrationFeePaid: Math.random() > 0.3,
    documentsComplete: Math.random() > 0.4,
    isOnlineRequest: Math.random() > 0.5,
    isActive: true,
    createdAt: requestDate,
  });
}

// ============ SAVINGS DATA ============

export const MOCK_SAVINGS: Saving[] = [
  {
    id: 1,
    savingNumber: 'S-2023-001',
    personId: 3,
    savingType: 'REGULAR',
    savingTypeName: 'פיקדון רגיל',
    initialAmount: 50000,
    currentBalance: 75000,
    totalDeposited: 80000,
    totalWithdrawn: 5000,
    accruedInterest: 0,
    interestRate: 0,
    openDate: new Date('2023-01-15'),
    lastTransactionDate: new Date('2024-10-01'),
    status: 'ACTIVE',
    statusName: 'פעיל',
    masavActive: true,
    monthlyDepositAmount: 2500,
    canWithdraw: true,
    isActive: true,
    createdAt: new Date('2023-01-10'),
  },
  {
    id: 2,
    savingNumber: 'S-2023-005',
    personId: 5,
    savingType: 'REGULAR',
    savingTypeName: 'פיקדון רגיל',
    initialAmount: 100000,
    currentBalance: 180000,
    totalDeposited: 200000,
    totalWithdrawn: 20000,
    accruedInterest: 0,
    interestRate: 0,
    openDate: new Date('2023-03-01'),
    lastTransactionDate: new Date('2024-09-15'),
    status: 'ACTIVE',
    statusName: 'פעיל',
    masavActive: true,
    monthlyDepositAmount: 5000,
    canWithdraw: true,
    isActive: true,
    createdAt: new Date('2023-02-25'),
  },
  {
    id: 3,
    savingNumber: 'S-2024-001',
    personId: 1,
    savingType: 'LOAN_COLLATERAL',
    savingTypeName: 'פיקדון כבטוחה',
    initialAmount: 5000,
    currentBalance: 15000,
    totalDeposited: 15000,
    totalWithdrawn: 0,
    accruedInterest: 0,
    interestRate: 0,
    openDate: new Date('2024-01-10'),
    linkedLoanId: 1,
    linkedLoanNumber: 'L-2024-001',
    status: 'ACTIVE',
    statusName: 'פעיל',
    masavActive: false,
    canWithdraw: false,
    minBalanceRequired: 5000,
    isActive: true,
    createdAt: new Date('2024-01-10'),
  },
];

// Generate more savings
for (let i = 4; i <= 25; i++) {
  const openDate = randomDate(new Date('2022-01-01'), new Date('2024-06-01'));
  const initial = randomItem([10000, 20000, 30000, 50000, 75000, 100000]);

  MOCK_SAVINGS.push({
    id: i,
    savingNumber: `S-${openDate.getFullYear()}-${String(i).padStart(3, '0')}`,
    personId: randomItem(MOCK_PERSONS.filter(p => p.personType.includes('DEPOSITOR'))).id,
    savingType: randomItem(['REGULAR', 'RECURRING']) as SavingType,
    initialAmount: initial,
    currentBalance: initial + Math.floor(Math.random() * initial),
    totalDeposited: initial + Math.floor(Math.random() * initial),
    totalWithdrawn: Math.floor(Math.random() * initial * 0.2),
    accruedInterest: 0,
    interestRate: 0,
    openDate,
    status: 'ACTIVE',
    masavActive: Math.random() > 0.3,
    canWithdraw: true,
    isActive: true,
    createdAt: openDate,
  });
}

// ============ DONATIONS DATA ============

export const MOCK_DONATIONS: Donation[] = [
  {
    id: 1,
    donationNumber: 'D-2024-001',
    receiptNumber: 'R-2024-001',
    personId: 3,
    amount: 1000,
    currency: 'ILS',
    donationType: 'ONE_TIME',
    donationTypeName: 'תרומה חד פעמית',
    paymentMethod: 'CREDIT_CARD',
    paymentMethodName: 'כרטיס אשראי',
    creditCardLast4: '4567',
    donationDate: new Date('2024-09-15'),
    receiptDate: new Date('2024-09-15'),
    status: 'COMPLETED',
    statusName: 'הושלם',
    receiptSent: true,
    receiptSentDate: new Date('2024-09-15'),
    receiptSentMethod: 'EMAIL',
    isRecurring: false,
    isTaxDeductible: true,
    isActive: true,
    createdAt: new Date('2024-09-15'),
  },
  {
    id: 2,
    donationNumber: 'D-2024-002',
    receiptNumber: 'R-2024-002',
    personId: 5,
    amount: 5000,
    currency: 'ILS',
    donationType: 'ONE_TIME',
    donationTypeName: 'תרומה חד פעמית',
    purpose: 1,
    purposeName: 'קרן הלוואות',
    paymentMethod: 'BANK_TRANSFER',
    paymentMethodName: 'העברה בנקאית',
    donationDate: new Date('2024-08-01'),
    receiptDate: new Date('2024-08-02'),
    status: 'COMPLETED',
    statusName: 'הושלם',
    receiptSent: true,
    isRecurring: false,
    isTaxDeductible: true,
    dedicatedTo: 'לעילוי נשמת אבי מורי ר\' אברהם ז"ל',
    isActive: true,
    createdAt: new Date('2024-08-01'),
  },
  {
    id: 3,
    donationNumber: 'D-2024-003',
    personId: 5,
    amount: 500,
    currency: 'ILS',
    donationType: 'RECURRING',
    donationTypeName: 'תרומה חוזרת',
    paymentMethod: 'CREDIT_CARD',
    paymentMethodName: 'כרטיס אשראי',
    creditCardLast4: '8901',
    donationDate: new Date('2024-10-01'),
    status: 'COMPLETED',
    statusName: 'הושלם',
    receiptSent: false,
    isRecurring: true,
    recurringFrequency: 'MONTHLY',
    isTaxDeductible: true,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

// Generate more donations
for (let i = 4; i <= 30; i++) {
  const donationDate = randomDate(new Date('2024-01-01'), new Date('2024-10-15'));
  MOCK_DONATIONS.push({
    id: i,
    donationNumber: `D-2024-${String(i).padStart(3, '0')}`,
    receiptNumber: Math.random() > 0.2 ? `R-2024-${String(i).padStart(3, '0')}` : undefined,
    personId: randomItem(MOCK_PERSONS.filter(p => p.personType.includes('DONOR'))).id || randomItem(MOCK_PERSONS).id,
    amount: randomItem([100, 180, 250, 500, 1000, 1800, 2500, 5000]),
    currency: 'ILS',
    donationType: randomItem(['ONE_TIME', 'RECURRING']) as DonationType,
    paymentMethod: randomItem(['CREDIT_CARD', 'CHECK', 'BANK_TRANSFER', 'CASH']) as PaymentMethodType,
    donationDate,
    status: randomItem(['COMPLETED', 'PENDING']) as DonationStatus,
    receiptSent: Math.random() > 0.3,
    isRecurring: Math.random() > 0.7,
    isTaxDeductible: true,
    isActive: true,
    createdAt: donationDate,
  });
}

// ============ PAY LINES DATA ============

export const MOCK_PAY_LINES: PayLine[] = [];

// Generate pay lines for loans
MOCK_LOANS.forEach(loan => {
  const paidCount = loan.paidPaymentsCount ?? 0;
  const overdueCount = loan.overduePaymentsCount ?? 0;
  const payMethod = loan.paymentMethod ?? 'CASH';

  for (let i = 0; i < paidCount + overdueCount + 2; i++) {
    const dueDate = new Date(loan.startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const isPaid = i < paidCount;
    const isOverdue = !isPaid && dueDate < new Date();

    MOCK_PAY_LINES.push({
      id: generateId(),
      payHeaderId: 0,
      lineNumber: i + 1,
      entityType: 'LOAN',
      entityId: loan.id,
      personId: loan.personId,
      payType: 'DEPOSIT',
      amount: loan.monthlyPayment,
      dueDate,
      paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined,
      status: isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'PENDING') as PayLineStatus,
      paymentMethod: payMethod,
      isActive: true,
      createdAt: loan.createdAt,
    });
  }
});

// ============ GL ACCOUNTS DATA ============

export const MOCK_GL_ACCOUNTS: GLAccount[] = [
  { id: 1, accountNumber: '1000', accountName: 'קופה ראשית', accountType: 'ASSET', category: 'CASH', level: 1, isHeader: false, balance: 50000, debitBalance: 50000, creditBalance: 0, openingBalance: 30000, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'CASH_MAIN' },
  { id: 2, accountNumber: '1100', accountName: 'בנק הפועלים', accountType: 'ASSET', category: 'BANK', level: 1, isHeader: false, balance: 500000, debitBalance: 500000, creditBalance: 0, openingBalance: 400000, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'BANK_MAIN' },
  { id: 3, accountNumber: '1200', accountName: 'הלוואות לגבייה', accountType: 'ASSET', category: 'LOANS_RECEIVABLE', level: 1, isHeader: false, balance: 750000, debitBalance: 750000, creditBalance: 0, openingBalance: 600000, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'LOANS_RECEIVABLE' },
  { id: 4, accountNumber: '2000', accountName: 'פיקדונות', accountType: 'LIABILITY', category: 'DEPOSITS_PAYABLE', level: 1, isHeader: false, balance: 450000, debitBalance: 0, creditBalance: 450000, openingBalance: 350000, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'DEPOSITS_PAYABLE' },
  { id: 5, accountNumber: '4000', accountName: 'הכנסות דמי רישום', accountType: 'INCOME', category: 'FEE_INCOME', level: 1, isHeader: false, balance: 15000, debitBalance: 0, creditBalance: 15000, openingBalance: 0, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'REGISTRATION_FEE_INCOME' },
  { id: 6, accountNumber: '4100', accountName: 'תרומות', accountType: 'INCOME', category: 'DONATIONS_RECEIVED', level: 1, isHeader: false, balance: 80000, debitBalance: 0, creditBalance: 80000, openingBalance: 0, currency: 'ILS', isActive: true, allowDirectPosting: true, isSystemAccount: true, systemCode: 'DONATION_INCOME' },
];

// ============ USERS DATA ============

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@gmach.org',
    firstName: 'מנהל',
    lastName: 'המערכת',
    fullName: 'מנהל המערכת',
    role: 'ADMIN',
    roleName: 'מנהל',
    permissions: [],
    institutionId: 1,
    isActive: true,
    isLocked: false,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    lastLoginAt: new Date(),
    createdAt: new Date('2020-01-01'),
  },
  {
    id: 2,
    username: 'operator1',
    email: 'operator1@gmach.org',
    firstName: 'יוסי',
    lastName: 'כהן',
    fullName: 'יוסי כהן',
    role: 'OPERATOR',
    roleName: 'מפעיל',
    permissions: [],
    institutionId: 1,
    isActive: true,
    isLocked: false,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    lastLoginAt: new Date('2024-10-18'),
    createdAt: new Date('2021-05-15'),
  },
  {
    id: 3,
    username: 'accountant',
    email: 'accountant@gmach.org',
    firstName: 'רחל',
    lastName: 'לוי',
    fullName: 'רחל לוי',
    role: 'ACCOUNTANT',
    roleName: 'רואה חשבון',
    permissions: [],
    institutionId: 1,
    isActive: true,
    isLocked: false,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    lastLoginAt: new Date('2024-10-17'),
    createdAt: new Date('2022-01-10'),
  },
];

// ============ ACTIVITIES DATA ============

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    activityType: 'PHONE_CALL',
    activityTypeName: 'שיחת טלפון',
    entityType: 'LOAN_REQUEST',
    entityId: 2,
    personId: 6,
    subject: 'תיאום הגעה להשלמת מסמכים',
    description: 'התקשרנו ללקוח לתאם הגעה להשלמת מסמכים חסרים',
    activityDate: new Date('2024-10-15'),
    status: 'COMPLETED',
    statusName: 'הושלם',
    priority: 'MEDIUM',
    followUpRequired: false,
    isActive: true,
    createdAt: new Date('2024-10-15'),
  },
  {
    id: 2,
    activityType: 'INTERVIEW_INVITATION',
    activityTypeName: 'הזמנה לראיון',
    entityType: 'LOAN_REQUEST',
    entityId: 4,
    personId: 8,
    subject: 'הזמנה לראיון בקשת הלוואה',
    scheduledDate: new Date('2024-10-20'),
    activityDate: new Date('2024-10-10'),
    status: 'SCHEDULED',
    statusName: 'מתוזמן',
    priority: 'HIGH',
    followUpRequired: true,
    followUpDate: new Date('2024-10-21'),
    isActive: true,
    createdAt: new Date('2024-10-10'),
  },
];

// ============ EXPORT ALL DATA ============

export const ALL_LOVS: Record<string, Lov[]> = {
  IDENTITY_TYPE: IDENTITY_TYPES,
  TITLE: TITLES,
  CITY: CITIES,
  BANK: BANKS,
  LOAN_PURPOSE: LOAN_PURPOSES,
  ACTIVITY_TYPE: ACTIVITY_TYPES,
  LOAN_STATUS: [],
  SAVING_TYPE: [],
  DONATION_PURPOSE: [],
  PAYMENT_METHOD: [],
  DOCUMENT_TYPE: [],
  RISK_LEVEL: [],
  NATURE_OF_PAYMENT: [],
  RELATION_TYPE: [],
  CURRENCY: [],
  COUNTRY: [],
};
