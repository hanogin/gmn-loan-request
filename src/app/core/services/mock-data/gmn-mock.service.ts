// GMN Mock Service - Central mock data service for the entire application
import { Injectable, computed, signal } from '@angular/core';
import {
  MOCK_PERSONS,
  MOCK_LOANS,
  MOCK_LOAN_REQUESTS,
  MOCK_SAVINGS,
  MOCK_DONATIONS,
  MOCK_PAY_LINES,
  MOCK_GL_ACCOUNTS,
  MOCK_USERS,
  MOCK_ACTIVITIES,
  ALL_LOVS,
  IDENTITY_TYPES,
  TITLES,
  CITIES,
  BANKS,
  LOAN_PURPOSES,
} from './mock-data';

import {
  Person,
  Loan, LoanRequest, LoanRequestStatus, LoanGuarantor,
  Saving, SavingTransaction,
  Donation,
  PayLine, PayHeader, PayType,
  GLAccount, GLTransaction,
  Activity,
  User,
  Lov, LovType,
  PaginatedResponse, PaginationParams, FilterParams, ApiResponse,
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class GmnMockService {
  // ============ SIGNALS FOR DATA ============
  private readonly _persons = signal<Person[]>([...MOCK_PERSONS]);
  private readonly _loans = signal<Loan[]>([...MOCK_LOANS]);
  private readonly _loanRequests = signal<LoanRequest[]>([...MOCK_LOAN_REQUESTS]);
  private readonly _savings = signal<Saving[]>([...MOCK_SAVINGS]);
  private readonly _donations = signal<Donation[]>([...MOCK_DONATIONS]);
  private readonly _payLines = signal<PayLine[]>([...MOCK_PAY_LINES]);
  private readonly _glAccounts = signal<GLAccount[]>([...MOCK_GL_ACCOUNTS]);
  private readonly _users = signal<User[]>([...MOCK_USERS]);
  private readonly _activities = signal<Activity[]>([...MOCK_ACTIVITIES]);

  // ============ PUBLIC COMPUTED SIGNALS ============
  readonly persons = this._persons.asReadonly();
  readonly loans = this._loans.asReadonly();
  readonly loanRequests = this._loanRequests.asReadonly();
  readonly savings = this._savings.asReadonly();
  readonly donations = this._donations.asReadonly();
  readonly payLines = this._payLines.asReadonly();
  readonly glAccounts = this._glAccounts.asReadonly();
  readonly users = this._users.asReadonly();
  readonly activities = this._activities.asReadonly();

  // ============ LOV GETTERS ============
  readonly identityTypes = signal(IDENTITY_TYPES);
  readonly titles = signal(TITLES);
  readonly cities = signal(CITIES);
  readonly banks = signal(BANKS);
  readonly loanPurposes = signal(LOAN_PURPOSES);

  // ============ DASHBOARD COMPUTED VALUES ============
  readonly dashboardStats = computed(() => ({
    totalPersons: this._persons().length,
    totalLoans: this._loans().length,
    activeLoans: this._loans().filter(l => l.status === 'ACTIVE').length,
    pendingLoanRequests: this._loanRequests().filter(lr => !['APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED_TO_LOAN'].includes(lr.status)).length,
    totalSavings: this._savings().length,
    totalDepositsBalance: this._savings().reduce((sum, s) => sum + s.currentBalance, 0),
    totalLoansBalance: this._loans().reduce((sum, l) => sum + (l.currentBalance || 0), 0),
    totalDonationsThisYear: this._donations()
      .filter(d => d.donationDate.getFullYear() === new Date().getFullYear())
      .reduce((sum, d) => sum + d.amount, 0),
    overdueLoans: this._loans().filter(l => (l.overduePaymentsCount || 0) > 0).length,
  }));

  // ============ GENERIC HELPERS ============

  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private paginate<T>(data: T[], params: PaginationParams): PaginatedResponse<T> {
    const total = data.length;
    const totalPages = Math.ceil(total / params.pageSize);
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;

    let sorted = [...data];
    if (params.sortField) {
      sorted.sort((a: any, b: any) => {
        const aVal = a[params.sortField!];
        const bVal = b[params.sortField!];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return params.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    return {
      data: sorted.slice(start, end),
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
    };
  }

  // ============ PERSON METHODS ============

  async getPersons(params?: PaginationParams, search?: string): Promise<PaginatedResponse<Person>> {
    await this.delay();
    let data = this._persons();

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(p =>
        p.firstName.toLowerCase().includes(s) ||
        p.lastName.toLowerCase().includes(s) ||
        p.identityNumber.includes(s) ||
        p.fullName?.toLowerCase().includes(s) ||
        p.contact.mobilePhone?.includes(s)
      );
    }

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getPersonById(id: number): Promise<Person | undefined> {
    await this.delay();
    return this._persons().find(p => p.id === id);
  }

  async getPersonByIdentity(identityNumber: string): Promise<Person | undefined> {
    await this.delay();
    return this._persons().find(p => p.identityNumber === identityNumber);
  }

  async createPerson(person: Omit<Person, 'id' | 'createdAt'>): Promise<ApiResponse<Person>> {
    await this.delay();

    // Check for duplicate identity
    if (this._persons().some(p => p.identityNumber === person.identityNumber)) {
      return { isSuccess: false, message: 'אדם עם מספר זהות זה כבר קיים במערכת' };
    }

    const newPerson: Person = {
      ...person,
      id: this.generateId(),
      fullName: `${person.firstName} ${person.lastName}`,
      createdAt: new Date(),
      isActive: true,
    };

    this._persons.update(persons => [...persons, newPerson]);
    return { isSuccess: true, data: newPerson };
  }

  async updatePerson(id: number, updates: Partial<Person>): Promise<ApiResponse<Person>> {
    await this.delay();

    const index = this._persons().findIndex(p => p.id === id);
    if (index === -1) {
      return { isSuccess: false, message: 'אדם לא נמצא' };
    }

    const updated = {
      ...this._persons()[index],
      ...updates,
      updatedAt: new Date(),
      fullName: updates.firstName || updates.lastName
        ? `${updates.firstName || this._persons()[index].firstName} ${updates.lastName || this._persons()[index].lastName}`
        : this._persons()[index].fullName,
    };

    this._persons.update(persons => {
      const newPersons = [...persons];
      newPersons[index] = updated;
      return newPersons;
    });

    return { isSuccess: true, data: updated };
  }

  // ============ LOAN REQUEST METHODS ============

  async getLoanRequests(params?: PaginationParams, status?: LoanRequestStatus[]): Promise<PaginatedResponse<LoanRequest>> {
    await this.delay();
    let data = this._loanRequests();

    if (status && status.length > 0) {
      data = data.filter(lr => status.includes(lr.status));
    }

    // Enrich with person data
    data = data.map(lr => ({
      ...lr,
      person: this._persons().find(p => p.id === lr.personId),
    }));

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getLoanRequestById(id: number): Promise<LoanRequest | undefined> {
    await this.delay();
    const lr = this._loanRequests().find(r => r.id === id);
    if (lr) {
      return {
        ...lr,
        person: this._persons().find(p => p.id === lr.personId),
      };
    }
    return undefined;
  }

  async createLoanRequest(request: Omit<LoanRequest, 'id' | 'requestNumber' | 'serialNumber' | 'createdAt'>): Promise<ApiResponse<LoanRequest>> {
    await this.delay();

    const serialNumber = Math.max(...this._loanRequests().map(lr => lr.serialNumber || 0)) + 1;
    const year = new Date().getFullYear();

    const newRequest: LoanRequest = {
      ...request,
      id: this.generateId(),
      requestNumber: `LR-${year}-${String(serialNumber).padStart(3, '0')}`,
      serialNumber,
      status: 'DRAFT',
      statusName: 'טיוטה',
      requestDate: new Date(),
      createdAt: new Date(),
      isActive: true,
    };

    this._loanRequests.update(requests => [...requests, newRequest]);
    return { isSuccess: true, data: newRequest };
  }

  async updateLoanRequestStatus(id: number, status: LoanRequestStatus, notes?: string): Promise<ApiResponse<LoanRequest>> {
    await this.delay();

    const index = this._loanRequests().findIndex(lr => lr.id === id);
    if (index === -1) {
      return { isSuccess: false, message: 'בקשת הלוואה לא נמצאה' };
    }

    const statusNames: Record<LoanRequestStatus, string> = {
      'DRAFT': 'טיוטה',
      'PENDING_DOCUMENTS': 'ממתין למסמכים',
      'PENDING_INTERVIEW': 'ממתין לראיון',
      'PENDING_GUARANTORS': 'ממתין לערבים',
      'PENDING_APPROVAL': 'ממתין לאישור',
      'APPROVED': 'אושר',
      'REJECTED': 'נדחה',
      'CANCELLED': 'בוטל',
      'CONVERTED_TO_LOAN': 'הומר להלוואה',
    };

    const updated: LoanRequest = {
      ...this._loanRequests()[index],
      status,
      statusName: statusNames[status],
      notes: notes || this._loanRequests()[index].notes,
      updatedAt: new Date(),
      ...(status === 'APPROVED' && { approvalDate: new Date() }),
      ...(status === 'REJECTED' && { rejectionDate: new Date(), rejectionReason: notes }),
    };

    this._loanRequests.update(requests => {
      const newRequests = [...requests];
      newRequests[index] = updated;
      return newRequests;
    });

    return { isSuccess: true, data: updated };
  }

  async approveLoanRequest(id: number, approvedAmount: number, termMonths: number): Promise<ApiResponse<LoanRequest>> {
    await this.delay();

    const index = this._loanRequests().findIndex(lr => lr.id === id);
    if (index === -1) {
      return { isSuccess: false, message: 'בקשת הלוואה לא נמצאה' };
    }

    const updated: LoanRequest = {
      ...this._loanRequests()[index],
      status: 'APPROVED',
      statusName: 'אושר',
      approvedAmount,
      approvedTermMonths: termMonths,
      approvalDate: new Date(),
      updatedAt: new Date(),
    };

    this._loanRequests.update(requests => {
      const newRequests = [...requests];
      newRequests[index] = updated;
      return newRequests;
    });

    return { isSuccess: true, data: updated };
  }

  // ============ LOAN METHODS ============

  async getLoans(params?: PaginationParams, filters?: { status?: string; personId?: number }): Promise<PaginatedResponse<Loan>> {
    await this.delay();
    let data = this._loans();

    if (filters?.status) {
      data = data.filter(l => l.status === filters.status);
    }
    if (filters?.personId) {
      data = data.filter(l => l.personId === filters.personId);
    }

    // Enrich with person data
    data = data.map(l => ({
      ...l,
      person: this._persons().find(p => p.id === l.personId),
    }));

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getLoanById(id: number): Promise<Loan | undefined> {
    await this.delay();
    const loan = this._loans().find(l => l.id === id);
    if (loan) {
      return {
        ...loan,
        person: this._persons().find(p => p.id === loan.personId),
      };
    }
    return undefined;
  }

  async createLoanFromRequest(loanRequestId: number): Promise<ApiResponse<Loan>> {
    await this.delay();

    const request = this._loanRequests().find(lr => lr.id === loanRequestId);
    if (!request) {
      return { isSuccess: false, message: 'בקשת הלוואה לא נמצאה' };
    }

    if (request.status !== 'APPROVED') {
      return { isSuccess: false, message: 'בקשת הלוואה לא אושרה' };
    }

    const year = new Date().getFullYear();
    const loanCount = this._loans().filter(l => l.loanNumber.includes(String(year))).length + 1;
    const termMonths = request.approvedTermMonths || 24;
    const loanAmount = request.approvedAmount || request.requestedAmount;

    const newLoan: Loan = {
      id: this.generateId(),
      loanNumber: `L-${year}-${String(loanCount).padStart(3, '0')}`,
      loanRequestId,
      personId: request.personId,
      loanAmount: loanAmount,
      currentBalance: loanAmount,
      totalPaid: 0,
      numberOfPayments: termMonths,
      paymentDay: 1,
      interestRate: 0,
      monthlyPayment: loanAmount / termMonths,
      startDate: new Date(),
      endDate: new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      statusName: 'פעיל',
      paymentMethod: 'MASAV',
      masavActive: true,
      bankAccount: request.bankAccount,
      guarantors: request.guarantors.map(g => g.personId).filter((id): id is number => id !== undefined),
      guarantorDetails: request.guarantors,
      paidPaymentsCount: 0,
      remainingPaymentsCount: termMonths,
      overduePaymentsCount: 0,
      overdueAmount: 0,
      isActive: true,
      createdAt: new Date(),
    };

    this._loans.update(loans => [...loans, newLoan]);

    // Update loan request status
    await this.updateLoanRequestStatus(loanRequestId, 'CONVERTED_TO_LOAN');

    return { isSuccess: true, data: newLoan };
  }

  // ============ SAVING METHODS ============

  async getSavings(params?: PaginationParams, filters?: { personId?: number }): Promise<PaginatedResponse<Saving>> {
    await this.delay();
    let data = this._savings();

    if (filters?.personId) {
      data = data.filter(s => s.personId === filters.personId);
    }

    // Enrich with person data
    data = data.map(s => ({
      ...s,
      person: this._persons().find(p => p.id === s.personId),
    }));

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getSavingById(id: number): Promise<Saving | undefined> {
    await this.delay();
    const saving = this._savings().find(s => s.id === id);
    if (saving) {
      return {
        ...saving,
        person: this._persons().find(p => p.id === saving.personId),
      };
    }
    return undefined;
  }

  async createSaving(saving: Omit<Saving, 'id' | 'savingNumber' | 'createdAt'>): Promise<ApiResponse<Saving>> {
    await this.delay();

    const year = new Date().getFullYear();
    const savingCount = this._savings().filter(s => s.savingNumber.includes(String(year))).length + 1;

    const newSaving: Saving = {
      ...saving,
      id: this.generateId(),
      savingNumber: `S-${year}-${String(savingCount).padStart(3, '0')}`,
      currentBalance: saving.initialAmount,
      totalDeposited: saving.initialAmount,
      totalWithdrawn: 0,
      accruedInterest: 0,
      status: 'ACTIVE',
      statusName: 'פעיל',
      openDate: new Date(),
      createdAt: new Date(),
      isActive: true,
    };

    this._savings.update(savings => [...savings, newSaving]);
    return { isSuccess: true, data: newSaving };
  }

  async deposit(savingId: number, amount: number): Promise<ApiResponse<Saving>> {
    await this.delay();

    const index = this._savings().findIndex(s => s.id === savingId);
    if (index === -1) {
      return { isSuccess: false, message: 'פיקדון לא נמצא' };
    }

    const updated: Saving = {
      ...this._savings()[index],
      currentBalance: this._savings()[index].currentBalance + amount,
      totalDeposited: this._savings()[index].totalDeposited + amount,
      lastTransactionDate: new Date(),
      updatedAt: new Date(),
    };

    this._savings.update(savings => {
      const newSavings = [...savings];
      newSavings[index] = updated;
      return newSavings;
    });

    return { isSuccess: true, data: updated };
  }

  async withdraw(savingId: number, amount: number): Promise<ApiResponse<Saving>> {
    await this.delay();

    const index = this._savings().findIndex(s => s.id === savingId);
    if (index === -1) {
      return { isSuccess: false, message: 'פיקדון לא נמצא' };
    }

    const saving = this._savings()[index];

    if (!saving.canWithdraw) {
      return { isSuccess: false, message: 'לא ניתן לבצע משיכה מפיקדון זה' };
    }

    if (saving.currentBalance - amount < (saving.minBalanceRequired || 0)) {
      return { isSuccess: false, message: 'יתרה לא מספיקה' };
    }

    const updated: Saving = {
      ...saving,
      currentBalance: saving.currentBalance - amount,
      totalWithdrawn: saving.totalWithdrawn + amount,
      lastTransactionDate: new Date(),
      updatedAt: new Date(),
    };

    this._savings.update(savings => {
      const newSavings = [...savings];
      newSavings[index] = updated;
      return newSavings;
    });

    return { isSuccess: true, data: updated };
  }

  // ============ DONATION METHODS ============

  async getDonations(params?: PaginationParams, filters?: { personId?: number; year?: number }): Promise<PaginatedResponse<Donation>> {
    await this.delay();
    let data = this._donations();

    if (filters?.personId) {
      data = data.filter(d => d.personId === filters.personId);
    }
    if (filters?.year) {
      data = data.filter(d => d.donationDate.getFullYear() === filters.year);
    }

    // Enrich with person data
    data = data.map(d => ({
      ...d,
      person: this._persons().find(p => p.id === d.personId),
    }));

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    await this.delay();
    const donation = this._donations().find(d => d.id === id);
    if (donation) {
      return {
        ...donation,
        person: this._persons().find(p => p.id === donation.personId),
      };
    }
    return undefined;
  }

  async createDonation(donation: Omit<Donation, 'id' | 'donationNumber' | 'createdAt'>): Promise<ApiResponse<Donation>> {
    await this.delay();

    const year = new Date().getFullYear();
    const donationCount = this._donations().filter(d => d.donationNumber.includes(String(year))).length + 1;

    const newDonation: Donation = {
      ...donation,
      id: this.generateId(),
      donationNumber: `D-${year}-${String(donationCount).padStart(3, '0')}`,
      status: 'COMPLETED',
      statusName: 'הושלם',
      createdAt: new Date(),
      isActive: true,
    };

    this._donations.update(donations => [...donations, newDonation]);
    return { isSuccess: true, data: newDonation };
  }

  // ============ PAY LINE METHODS ============

  async getPayLines(params?: PaginationParams, filters?: { entityType?: string; entityId?: number; status?: string }): Promise<PaginatedResponse<PayLine>> {
    await this.delay();
    let data = this._payLines();

    if (filters?.entityType) {
      data = data.filter(pl => pl.entityType === filters.entityType);
    }
    if (filters?.entityId) {
      data = data.filter(pl => pl.entityId === filters.entityId);
    }
    if (filters?.status) {
      data = data.filter(pl => pl.status === filters.status);
    }

    // Enrich with person data
    data = data.map(pl => ({
      ...pl,
      personName: this._persons().find(p => p.id === pl.personId)?.fullName,
    }));

    return this.paginate(data, params || { page: 1, pageSize: 20 });
  }

  async getOverduePayLines(): Promise<PayLine[]> {
    await this.delay();
    return this._payLines()
      .filter(pl => pl.status === 'OVERDUE')
      .map(pl => ({
        ...pl,
        personName: this._persons().find(p => p.id === pl.personId)?.fullName,
      }));
  }

  // ============ LOV METHODS ============

  getLovByType(type: LovType): Lov[] {
    return ALL_LOVS[type] || [];
  }

  getLovById(type: LovType, id: number): Lov | undefined {
    return this.getLovByType(type).find(l => l.id === id);
  }

  // ============ UTILITY METHODS ============

  getBankDisplayName(bank: Lov): string {
    return `${bank.id} - ${bank.name}`;
  }

  getCityName(cityId: number): string {
    return CITIES.find(c => c.id === cityId)?.name || '';
  }

  getIdentityTypeName(typeId: number): string {
    return IDENTITY_TYPES.find(t => t.id === typeId)?.name || '';
  }

  getTitleName(titleId: number): string {
    return TITLES.find(t => t.id === titleId)?.name || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(date);
  }
}
