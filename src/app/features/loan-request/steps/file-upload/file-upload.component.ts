import { Component, inject, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUploadCloud,
  lucideFile,
  lucideFileImage,
  lucideX,
  lucideFolder
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { toast } from '@spartan-ng/brain/sonner';

import { LoanRequestService } from '../../services/loan-request.service';

@Component({
  selector: 'app-file-upload-step',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideUploadCloud,
      lucideFile,
      lucideFileImage,
      lucideX,
      lucideFolder,
    }),
  ],
  template: `
    <div class="step-container" dir="rtl">
      <!-- Step Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ng-icon name="lucideUploadCloud" class="h-8 w-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold">{{ 'loanRequest.steps.fileUpload' | transloco }}</h2>
        <p class="mt-2 text-muted-foreground">{{ 'loanRequest.fileUpload.description' | transloco }}</p>
      </div>

      <!-- Drop Zone -->
      <div
        class="dropzone relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50 hover:bg-muted"
        [class.border-primary]="isDragging"
        [class.bg-primary/5]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf"
          class="hidden"
          (change)="onFileSelected($event)"
        />

        <ng-icon name="lucideUploadCloud" class="mb-4 h-12 w-12 text-muted-foreground" />
        <p class="mb-2 text-lg font-medium">{{ 'loanRequest.fileUpload.dragDrop' | transloco }}</p>
        <p class="text-sm text-muted-foreground">{{ 'loanRequest.fileUpload.allowedTypes' | transloco }}</p>

        <button
          hlmBtn
          variant="secondary"
          size="sm"
          class="mt-4"
          (click)="$event.stopPropagation(); fileInput.click()"
        >
          <ng-icon name="lucideFolder" class="me-2 h-4 w-4" />
          {{ 'loanRequest.fileUpload.selectFiles' | transloco }}
        </button>
      </div>

      <!-- Uploaded Files List -->
      @if (loanService.uploadedFiles().length > 0) {
        <div class="mt-6 space-y-3">
          <h3 class="font-medium">{{ 'loanRequest.fileUpload.uploadedFiles' | transloco }}</h3>

          @for (file of loanService.uploadedFiles(); track file.name; let i = $index) {
            <div class="flex items-center justify-between rounded-lg border bg-card p-3">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  @if (isImage(file)) {
                    <ng-icon name="lucideFileImage" class="h-5 w-5 text-primary" />
                  } @else {
                    <ng-icon name="lucideFile" class="h-5 w-5 text-primary" />
                  }
                </div>
                <div>
                  <p class="font-medium">{{ file.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>

              <button
                hlmBtn
                variant="ghost"
                size="icon"
                class="text-destructive hover:bg-destructive/10"
                (click)="removeFile(i)"
              >
                <ng-icon name="lucideX" class="h-4 w-4" />
              </button>
            </div>
          }
        </div>
      }

      <!-- Validation Message -->
      @if (loanService.uploadedFiles().length === 0) {
        <p class="mt-4 text-center text-sm text-muted-foreground">
          {{ 'loanRequest.fileUpload.required' | transloco }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dropzone {
      transition: all 0.2s ease;
    }
  `]
})
export class FileUploadStepComponent {
  // Services
  protected readonly loanService = inject(LoanRequestService);

  // Outputs
  valid = output<boolean>();

  // State
  isDragging = false;

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  private handleFiles(files: File[]): void {
    for (const file of files) {
      const success = this.loanService.addFile(file);

      if (success) {
        toast.success(`הקובץ ${file.name} הועלה בהצלחה`);
      } else {
        // Check why it failed
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

        if (!allowedTypes.includes(file.type)) {
          toast.error(`סוג הקובץ ${file.name} אינו נתמך`);
        } else if (file.size > maxSize) {
          toast.error(`הקובץ ${file.name} גדול מ-10MB`);
        } else {
          toast.error(`הקובץ ${file.name} כבר הועלה`);
        }
      }
    }

    this.valid.emit(this.loanService.uploadedFiles().length > 0);
  }

  removeFile(index: number): void {
    this.loanService.removeFile(index);
    toast.info('הקובץ הוסר');
    this.valid.emit(this.loanService.uploadedFiles().length > 0);
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
