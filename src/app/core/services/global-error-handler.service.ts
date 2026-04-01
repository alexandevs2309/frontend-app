import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FrontendObservabilityService } from './frontend-observability.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly observability = inject(FrontendObservabilityService);
  private readonly messageService = inject(MessageService);

  handleError(error: any): void {
    const normalized = this.normalizeError(error);

    this.observability.captureError(normalized.message, normalized.context);
    this.messageService.add({
      severity: 'error',
      summary: 'Error inesperado',
      detail: 'La aplicacion encontro un error inesperado. El evento fue registrado.',
      life: 4000
    });
  }

  private normalizeError(error: any): { message: string; context: unknown } {
    if (error?.rejection) {
      return this.normalizeError(error.rejection);
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        context: {
          name: error.name,
          stack: error.stack
        }
      };
    }

    return {
      message: 'Unhandled frontend error',
      context: error
    };
  }
}
