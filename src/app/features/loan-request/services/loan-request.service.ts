import { Injectable, computed, inject, signal } from '@angular/core';
import { 
  DEFAULT_COUNTRY_CODE, 
  DEFAULT_REGISTRATION_FEE, 
  Guarantor, 
  LOAN_REQUEST_STEPS, 
  LoanRequest, 
  LoanRequestResponse, 
  LoanRequestStep, 
  MAX_GUARANTORS, 
  MIN_GUARANTORS, 
  PaymentMethod, 
  TokenValidation 
} from '../models/loan-request.model';

/**
 * Loan Request Service
 * Manages the state and logic for the loan request wizard
 */
@Injectable({ providedIn: 'root' })
export class LoanRequestService {
  // ==========================================
  // State
  // ==========================================

  // Current step (1-6)
  readonly currentStep = signal<number>(1);
  
  // Maximum step reached (for navigation validation)
  readonly maxReachedStep = signal<number>(1);
  
  // Steps configuration
  readonly steps = signal<LoanRequestStep[]>(LOAN_REQUEST_STEPS.map(s => ({ ...s })));
  
  // Loading state
  readonly isLoading = signal<boolean>(false);
  
  // Token validation state
  readonly tokenValidated = signal<boolean>(false);
  
  // Main form data
  readonly formData = signal<Partial<LoanRequest>>({
    token: '',
    firstName: '',
    lastName: '',
    identityType: 0,
    identityNumber: '',
    title: 0,
    street: '',
    houseNumber: '',
    apartment: '',
    city: 0,
    countryCode: DEFAULT_COUNTRY_CODE,
    mobilePhone: '',
    phone: '',
    email: '',
    profession: '',
    loanAmount: 0,
    amountInWords: '',
    purpose: 0,
    attachmentFiles: [],
    bankId: 0,
    branchNumber: '',
    accountName: '',
    accountNumber: '',
    guarantors: [],
    paymentMethod: 'credit',
    registrationFeeAmount: DEFAULT_REGISTRATION_FEE,
  });

  // Uploaded files
  readonly uploadedFiles = signal<File[]>([]);
  
  // Guarantors
  readonly guarantors = signal<Guarantor[]>([]);
  
  // Result after submission
  readonly submissionResult = signal<LoanRequestResponse | null>(null);

  // ==========================================
  // Computed
  // ==========================================

  readonly savedGuarantorsCount = computed(() => 
    this.guarantors().filter(g => g.isSaved).length
  );

  readonly canAddMoreGuarantors = computed(() => 
    this.guarantors().length < MAX_GUARANTORS
  );

  readonly hasMinimumGuarantors = computed(() => 
    this.savedGuarantorsCount() >= MIN_GUARANTORS
  );

  readonly isStepValid = computed(() => {
    const step = this.currentStep();
    const data = this.formData();
    
    switch (step) {
      case 1: // Personal Info
        return !!(
          data.firstName && 
          data.lastName && 
          data.identityType && 
          data.identityNumber &&
          data.title &&
          data.street &&
          data.houseNumber &&
          data.city &&
          data.mobilePhone &&
          data.email &&
          data.profession &&
          data.loanAmount && data.loanAmount > 0
        );
      case 2: // File Upload
        return this.uploadedFiles().length > 0;
      case 3: // Bank Account
        return !!(
          data.bankId &&
          data.branchNumber &&
          data.accountName &&
          data.accountNumber
        );
      case 4: // Guarantors
        return this.hasMinimumGuarantors();
      case 5: // Payment
        return !!data.paymentMethod;
      case 6: // Completion
        return true;
      default:
        return false;
    }
  });

  // ==========================================
  // Methods
  // ==========================================

  /**
   * Validate access token
   */
  validateToken(token: string): Promise<TokenValidation> {
    return new Promise((resolve) => {
      this.isLoading.set(true);
      
      // Simulate API call
      setTimeout(() => {
        const isValid = this.isValidGuid(token);
        
        if (isValid) {
          this.updateFormData({ token });
          this.tokenValidated.set(true);
        }
        
        this.isLoading.set(false);
        resolve({ isValid, message: isValid ? '' : 'הלינק שהוזן לא בתוקף פנה למשרד לקבלת לינק חדש' });
      }, 500);
    });
  }

  /**
   * Navigate to a specific step
   */
  goToStep(step: number): void {
    if (step < 1 || step > 6) return;
    if (step > this.maxReachedStep() + 1) return;
    
    this.currentStep.set(step);
    this.updateStepsState();
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    const current = this.currentStep();
    if (current < 6) {
      const next = current + 1;
      this.currentStep.set(next);
      
      if (next > this.maxReachedStep()) {
        this.maxReachedStep.set(next);
      }
      
      this.updateStepsState();
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    const current = this.currentStep();
    if (current > 1) {
      this.currentStep.set(current - 1);
      this.updateStepsState();
    }
  }

  /**
   * Update form data
   */
  updateFormData(data: Partial<LoanRequest>): void {
    this.formData.update(current => ({ ...current, ...data }));
  }

  /**
   * Add a file to uploads
   */
  addFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    
    if (file.size > maxSize) {
      return false;
    }
    
    // Check for duplicates
    const exists = this.uploadedFiles().some(f => f.name === file.name && f.size === file.size);
    if (exists) {
      return false;
    }
    
    this.uploadedFiles.update(files => [...files, file]);
    return true;
  }

  /**
   * Remove a file from uploads
   */
  removeFile(index: number): void {
    this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
  }

  /**
   * Add a new guarantor
   */
  addGuarantor(): Guarantor | null {
    if (!this.canAddMoreGuarantors()) return null;
    
    const newGuarantor: Guarantor = {
      firstName: '',
      lastName: '',
      identityType: 58, // Default to ID card
      identityNumber: '',
      street: '',
      houseNumber: '',
      apartment: '',
      city: 0,
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: '',
      profession: '',
      email: '',
      isSaved: false,
    };
    
    this.guarantors.update(list => [...list, newGuarantor]);
    return newGuarantor;
  }

  /**
   * Update a guarantor
   */
  updateGuarantor(index: number, data: Partial<Guarantor>): void {
    this.guarantors.update(list => 
      list.map((g, i) => i === index ? { ...g, ...data } : g)
    );
  }

  /**
   * Save a guarantor (mark as saved)
   */
  saveGuarantor(index: number): boolean {
    const guarantor = this.guarantors()[index];
    if (!guarantor) return false;
    
    // Validate required fields
    if (!guarantor.firstName || !guarantor.lastName || !guarantor.identityNumber ||
        !guarantor.street || !guarantor.houseNumber || !guarantor.city ||
        !guarantor.phone || !guarantor.profession || !guarantor.email) {
      return false;
    }
    
    // Check for duplicate identity
    const isDuplicate = this.guarantors().some((g, i) => 
      i !== index && g.identityNumber === guarantor.identityNumber
    );
    
    if (isDuplicate) return false;
    
    // Check if guarantor is the applicant
    if (guarantor.identityNumber === this.formData().identityNumber) {
      return false;
    }
    
    this.updateGuarantor(index, { isSaved: true });
    return true;
  }

  /**
   * Remove a guarantor
   */
  removeGuarantor(index: number): void {
    this.guarantors.update(list => list.filter((_, i) => i !== index));
  }

  /**
   * Set payment method
   */
  setPaymentMethod(method: PaymentMethod): void {
    this.updateFormData({ paymentMethod: method });
  }

  /**
   * Submit the loan request
   */
  async submitRequest(): Promise<LoanRequestResponse> {
    this.isLoading.set(true);
    
    try {
      // Prepare the full request data
      const requestData: LoanRequest = {
        ...this.formData() as LoanRequest,
        attachmentFiles: this.uploadedFiles(),
        guarantors: this.guarantors().filter(g => g.isSaved),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: LoanRequestResponse = {
        success: true,
        requestId: Math.floor(Math.random() * 100000) + 1000,
        serialNumber: this.generateSerialNumber(),
      };
      
      this.submissionResult.set(result);
      this.nextStep(); // Move to completion step
      
      return result;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reset the entire form
   */
  reset(): void {
    this.currentStep.set(1);
    this.maxReachedStep.set(1);
    this.tokenValidated.set(false);
    this.uploadedFiles.set([]);
    this.guarantors.set([]);
    this.submissionResult.set(null);
    this.formData.set({
      token: '',
      firstName: '',
      lastName: '',
      identityType: 0,
      identityNumber: '',
      title: 0,
      street: '',
      houseNumber: '',
      apartment: '',
      city: 0,
      countryCode: DEFAULT_COUNTRY_CODE,
      mobilePhone: '',
      phone: '',
      email: '',
      profession: '',
      loanAmount: 0,
      amountInWords: '',
      purpose: 0,
      attachmentFiles: [],
      bankId: 0,
      branchNumber: '',
      accountName: '',
      accountNumber: '',
      guarantors: [],
      paymentMethod: 'credit',
      registrationFeeAmount: DEFAULT_REGISTRATION_FEE,
    });
    this.steps.set(LOAN_REQUEST_STEPS.map(s => ({ ...s })));
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private updateStepsState(): void {
    const current = this.currentStep();
    
    this.steps.update(steps => 
      steps.map((step, index) => ({
        ...step,
        isActive: step.id === current,
        isCompleted: step.id < current,
      }))
    );
  }

  private isValidGuid(token: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(token);
  }

  private generateSerialNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LR-${year}${month}-${random}`;
  }
}
