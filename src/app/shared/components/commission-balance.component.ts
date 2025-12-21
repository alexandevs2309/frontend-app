import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PagosService } from '../../pages/client/pagos/services/pagos.service';


@Component({
  selector: 'app-commission-balance',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, DialogModule, InputTextModule, FormsModule],
  providers: [MessageService],
  template: `
    <!-- Bloque informativo del flujo -->
    <div *ngIf="shouldShowBalance()" class="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
      <h4 class="text-sm font-medium text-blue-800 mb-2">💡 ¿Cómo funciona tu balance?</h4>
      <div class="text-xs text-blue-700 space-y-1">
        <div>1. Realizas ventas → Se generan ganancias automáticamente</div>
        <div>2. Tus ganancias se acumulan → Forman tu balance disponible</div>
        <div>3. Solicitas un retiro → Se procesa el pago</div>
        <div>4. Si tienes préstamos → Se descuentan en ese momento</div>
      </div>
    </div>
    
    <p-card *ngIf="shouldShowBalance()" styleClass="bg-green-50 border-green-200">
      <div class="text-center">
        <div *ngIf="cargando()" class="text-green-600">
          <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
        
        <div *ngIf="!cargando() && saldoData()">
          <div class="text-2xl font-bold text-green-600 mb-2">{{ formatearMoneda(saldoData()?.available_balance || 0) }}</div>
          <div class="text-sm text-green-700 mb-2">Balance Disponible para Retiro</div>
          <div class="text-xs text-green-600 mb-4">Balance = Ganancias totales - Pagos recibidos</div>
          
          <button *ngIf="(saldoData()?.available_balance || 0) > 0" 
                  pButton label="Retirar Saldo" icon="pi pi-download" 
                  class="p-button-success p-button-sm" 
                  (click)="abrirDialogoRetiro()"
                  [disabled]="procesandoRetiro()"></button>
        </div>
        
        <div *ngIf="!cargando() && error()" class="text-sm text-red-600">
          <i class="pi pi-exclamation-triangle mr-1"></i>
          {{ error() }}
        </div>
      </div>
    </p-card>
    

    
    <!-- Diálogo de retiro -->
    <p-dialog [(visible)]="mostrarDialogoRetiro" header="Retirar Comisiones" 
              [modal]="true" [style]="{width: '450px'}">
      <div *ngIf="saldoData()" class="space-y-4">
        <!-- Información del saldo -->
        <div class="bg-green-50 p-3 rounded border border-green-200">
          <h4 class="font-medium text-green-800 mb-2">💰 Saldo Disponible</h4>
          <p class="text-2xl font-bold text-green-700">{{ formatearMoneda(saldoData()?.available_balance || 0) }}</p>
          <p class="text-xs text-green-600 mt-1">
            Comisiones acumuladas desde {{ formatearFecha(saldoData()?.commission_on_demand_since) }}
          </p>
        </div>
        
        <!-- Monto a retirar -->
        <div>
          <label class="block text-sm font-medium mb-2">Monto a Retirar (RD$)</label>
          <input type="number" pInputText [(ngModel)]="montoRetiro" 
                 class="w-full" placeholder="0.00" 
                 [max]="saldoData()?.available_balance" 
                 min="0.01" step="0.01"
                 (ngModelChange)="validarMontoRetiro()">
          <div class="flex justify-between mt-2">
            <button type="button" class="text-xs text-blue-600 hover:underline" 
                    (click)="establecerMontoCompleto()">Retirar todo</button>
            <span class="text-xs text-gray-500">Máximo: {{ formatearMoneda(saldoData()?.available_balance || 0) }}</span>
          </div>
        </div>
        
        <!-- Validación -->
        <div *ngIf="errorRetiro()" class="bg-red-50 p-2 rounded border border-red-200">
          <p class="text-sm text-red-700">
            <i class="pi pi-exclamation-triangle mr-1"></i>
            {{ errorRetiro() }}
          </p>
        </div>
        
        <!-- Vista previa del retiro -->
        <div *ngIf="montoRetiro > 0 && !errorRetiro()" class="bg-blue-50 p-3 rounded border border-blue-200">
          <p class="text-sm text-blue-800">
            <i class="pi pi-info-circle mr-1"></i>
            <strong>Retiro a procesar:</strong> {{ formatearMoneda(montoRetiro) }}
          </p>
          <p class="text-xs text-blue-600 mt-1">
            Saldo restante: {{ formatearMoneda((saldoData()?.available_balance || 0) - montoRetiro) }}
          </p>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-outlined" 
                (click)="cerrarDialogoRetiro()"></button>
        <button pButton label="Continuar" class="p-button-success" 
                (click)="abrirConfirmacion()"
                [disabled]="!montoRetiro || montoRetiro <= 0 || errorRetiro()"></button>
      </ng-template>
    </p-dialog>
    
    <!-- NUEVO: Diálogo de confirmación con préstamos -->
    <p-dialog [(visible)]="mostrarConfirmacionPrestamos" header="⚠️ Confirmación de Retiro con Préstamos" 
              [modal]="true" [style]="{width: '550px'}">
      <div *ngIf="previewData()" class="space-y-4">
        <!-- Alerta de préstamos -->
        <div class="bg-orange-50 p-4 rounded border border-orange-200">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle text-orange-600 text-lg mt-1"></i>
            <div>
              <h4 class="font-medium text-orange-800 mb-2">💰 Tienes préstamos activos</h4>
              <p class="text-sm text-orange-700">
                Los préstamos se descuentan automáticamente al momento del pago. Puedes elegir aplicar el descuento en este retiro.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Información de préstamos -->
        <div class="bg-white border border-gray-200 rounded p-4">
          <h4 class="font-semibold text-gray-800 mb-3">📄 Detalle de Préstamos</h4>
          
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Total adeudado:</span>
              <span class="font-medium text-red-600">{{ formatearMoneda(previewData()?.loan_info?.total_loan_debt || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Descuento sugerido:</span>
              <span class="font-medium text-orange-600">{{ formatearMoneda(previewData()?.loan_info?.suggested_deduction || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Máximo permitido (50%):</span>
              <span class="font-medium text-gray-600">{{ formatearMoneda(previewData()?.loan_info?.max_deduction_allowed || 0) }}</span>
            </div>
          </div>
          
          <!-- Préstamos individuales -->
          <div *ngIf="previewData()?.loan_info?.loans_details?.length > 0" class="border-t pt-3">
            <p class="text-xs text-gray-600 mb-2">Préstamos activos:</p>
            <div *ngFor="let loan of previewData()?.loan_info?.loans_details" 
                 class="flex justify-between text-xs text-gray-500 mb-1">
              <span>{{ loan.loan_type }}</span>
              <span>Saldo: {{ formatearMoneda(loan.remaining_balance) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Opción de descuento -->
        <div class="bg-blue-50 p-4 rounded border border-blue-200">
          <div class="flex items-start gap-3">
            <input type="checkbox" [(ngModel)]="aplicarDescuentoPrestamo" 
                   id="aplicarDescuento" class="mt-1">
            <label for="aplicarDescuento" class="text-sm text-blue-800 cursor-pointer">
              <strong>✅ Aplicar descuento de préstamo</strong><br>
              <span class="text-xs text-blue-600">
                Descontar {{ formatearMoneda(previewData()?.loan_info?.suggested_deduction || 0) }} 
                de este retiro para abonar a mis préstamos.
              </span>
            </label>
          </div>
        </div>
        
        <!-- Cálculo final -->
        <div class="bg-gray-50 p-4 rounded">
          <h4 class="font-semibold text-gray-800 mb-3">📊 Cálculo Final</h4>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Monto solicitado:</span>
              <span class="font-medium">{{ formatearMoneda(montoRetiro) }}</span>
            </div>
            <div *ngIf="aplicarDescuentoPrestamo" class="flex justify-between">
              <span class="text-gray-600">Descuento préstamo:</span>
              <span class="font-medium text-red-600">-{{ formatearMoneda(previewData()?.loan_info?.suggested_deduction || 0) }}</span>
            </div>
            <hr class="border-gray-300">
            <div class="flex justify-between">
              <span class="text-gray-800 font-medium">Monto a recibir:</span>
              <span class="font-bold text-green-600">
                {{ formatearMoneda(montoRetiro - (aplicarDescuentoPrestamo ? (previewData()?.loan_info?.suggested_deduction || 0) : 0)) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Aceptación del empleado -->
        <div class="bg-blue-50 p-4 rounded border border-blue-200">
          <div class="flex items-start gap-3">
            <input type="checkbox" [(ngModel)]="aceptacionEmpleado" 
                   id="aceptacionPrestamos" class="mt-1">
            <label for="aceptacionPrestamos" class="text-sm text-blue-800 cursor-pointer">
              <strong>✓ Confirmación del Empleado</strong><br>
              <span class="text-xs text-blue-600">
                Confirmo que entiendo las condiciones de este retiro 
                {{ aplicarDescuentoPrestamo ? 'con descuento de préstamo' : 'sin descuento de préstamo' }}.
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-outlined" 
                (click)="cerrarConfirmacion()"></button>
        <button pButton label="Confirmar Retiro" 
                [class]="aplicarDescuentoPrestamo ? 'p-button-warning' : 'p-button-success'" 
                [loading]="procesandoRetiro()" 
                (click)="confirmarRetiro()"
                [disabled]="procesandoRetiro() || !aceptacionEmpleado">
          {{ aplicarDescuentoPrestamo ? 'Retirar con Descuento' : 'Retirar sin Descuento' }}
        </button>
      </ng-template>
    </p-dialog>
    
    <!-- Diálogo de confirmación final (SIN préstamos) -->
    <p-dialog [(visible)]="mostrarConfirmacion" header="Confirmar Retiro" 
              [modal]="true" [style]="{width: '500px'}">
      <div *ngIf="saldoData()" class="space-y-4">
        <!-- Advertencia -->
        <div class="bg-yellow-50 p-4 rounded border border-yellow-200">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-600 text-lg mt-1"></i>
            <div>
              <h4 class="font-medium text-yellow-800 mb-2">⚠️ Confirme los detalles del retiro</h4>
              <p class="text-sm text-yellow-700">
                Esta acción no se puede deshacer. Verifique que toda la información sea correcta.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Resumen del retiro -->
        <div class="bg-white border border-gray-200 rounded p-4">
          <h4 class="font-semibold text-gray-800 mb-3">💰 Resumen del Retiro</h4>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Saldo actual:</span>
              <span class="font-medium">{{ formatearMoneda(saldoData()?.available_balance || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Monto a retirar:</span>
              <span class="font-bold text-red-600">-{{ formatearMoneda(montoRetiro) }}</span>
            </div>
            <hr class="border-gray-200">
            <div class="flex justify-between">
              <span class="text-gray-600">Saldo restante:</span>
              <span class="font-bold text-green-600">{{ formatearMoneda((saldoData()?.available_balance || 0) - montoRetiro) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Información adicional -->
        <div class="bg-gray-50 p-3 rounded text-xs text-gray-600">
          <p class="mb-1">• El retiro se procesará inmediatamente</p>
          <p class="mb-1">• Se generará un recibo automáticamente</p>
          <p class="mb-1">• Límite diario: RD$10,000</p>
          <p>• Tiempo mínimo entre retiros: 5 minutos</p>
        </div>
        
        <!-- Aceptación del empleado -->
        <div class="bg-blue-50 p-4 rounded border border-blue-200">
          <div class="flex items-start gap-3">
            <input type="checkbox" [(ngModel)]="aceptacionEmpleado" 
                   id="aceptacion" class="mt-1">
            <label for="aceptacion" class="text-sm text-blue-800 cursor-pointer">
              <strong>✓ Confirmación del Empleado</strong><br>
              <span class="text-xs text-blue-600">
                Confirmo que este retiro corresponde a comisiones ya generadas por mis ventas realizadas. 
                Entiendo que esta acción es irreversible y acepto la responsabilidad del retiro.
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-outlined" 
                (click)="cerrarConfirmacion()"></button>
        <button pButton label="Confirmar y Procesar" class="p-button-danger" 
                [loading]="procesandoRetiro()" 
                (click)="confirmarRetiro()"
                [disabled]="procesandoRetiro() || !aceptacionEmpleado"></button>
      </ng-template>
    </p-dialog>
  `
})
export class CommissionBalanceComponent implements OnInit {
  @Input() employeeId!: number;
  @Input() commissionPaymentMode?: string;
  
  private pagosService = inject(PagosService);
  private messageService = inject(MessageService);
  
  saldoData = signal<any>(null);
  cargando = signal(false);
  error = signal<string>('');
  
  // Retiro
  mostrarDialogoRetiro = false;
  mostrarConfirmacion = false;
  montoRetiro = 0;
  aceptacionEmpleado = false;
  procesandoRetiro = signal(false);
  errorRetiro = signal<string>('');

  ngOnInit() {
    if (this.shouldShowBalance()) {
      this.cargarSaldo();
    }
  }

  shouldShowBalance(): boolean {
    return this.commissionPaymentMode === 'ON_DEMAND' && this.employeeId > 0;
  }

  cargarSaldo() {
    if (!this.employeeId) return;
    
    this.cargando.set(true);
    this.error.set('');
    
    this.pagosService.obtenerSaldoComision(this.employeeId).subscribe({
      next: (response) => {
        // Adaptar respuesta del endpoint earnings_summary
        const empleado = response.employees?.find((emp: any) => emp.employee_id === this.employeeId);
        if (empleado) {
          const saldoAdaptado = {
            available_balance: empleado.pending_amount || 0,
            commission_on_demand_since: new Date().toISOString()
          };
          this.saldoData.set(saldoAdaptado);
        } else {
          this.saldoData.set({ available_balance: 0, commission_on_demand_since: new Date().toISOString() });
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando saldo:', error);
        this.error.set('Error al cargar saldo');
        this.cargando.set(false);
      }
    });
  }

  formatearMoneda(valor: number): string {
    return `$${valor?.toFixed(2) || '0.00'}`;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
  
  abrirDialogoRetiro() {
    this.montoRetiro = 0;
    this.errorRetiro.set('');
    this.mostrarDialogoRetiro = true;
  }
  
  cerrarDialogoRetiro() {
    this.mostrarDialogoRetiro = false;
    this.mostrarConfirmacion = false;
    this.mostrarConfirmacionPrestamos = false;
    this.montoRetiro = 0;
    this.aceptacionEmpleado = false;
    this.aplicarDescuentoPrestamo = false;
    this.previewData.set(null);
    this.errorRetiro.set('');
  }
  
  abrirConfirmacion() {
    if (!this.montoRetiro || this.montoRetiro <= 0 || this.errorRetiro()) {
      return;
    }
    
    // PUNTO 1: PREVIEW antes de mostrar confirmación
    this.ejecutarPreviewPago();
  }
  
  // NUEVO: Preview de pago para verificar préstamos
  previewData = signal<any>(null);
  
  ejecutarPreviewPago() {
    this.procesandoRetiro.set(true);
    
    // Usar el endpoint preview_payment del flujo normal
    const previewPayload = {
      employee_id: this.employeeId,
      sale_ids: [], // Retiro ON_DEMAND usa ventas pendientes
      apply_loan_deduction: true
    };
    
    this.pagosService.obtenerPreviewPago(previewPayload).subscribe({
      next: (response) => {
        console.log('Preview response:', response);
        this.previewData.set(response.preview);
        this.procesandoRetiro.set(false);
        
        if (response.preview?.loan_info?.has_active_loans) {
          this.mostrarConfirmacionConPrestamos();
        } else {
          this.mostrarDialogoRetiro = false;
          this.mostrarConfirmacion = true;
        }
      },
      error: (error) => {
        console.error('Error en preview:', error);
        this.procesandoRetiro.set(false);
        // Continuar sin préstamos si falla
        this.mostrarDialogoRetiro = false;
        this.mostrarConfirmacion = true;
      }
    });
  }
  
  // NUEVO: Modal específico para confirmación con préstamos
  mostrarConfirmacionPrestamos = false;
  aplicarDescuentoPrestamo = false;
  
  mostrarConfirmacionConPrestamos() {
    this.mostrarDialogoRetiro = false;
    this.mostrarConfirmacionPrestamos = true;
  }
  
  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.mostrarConfirmacionPrestamos = false;
    this.aceptacionEmpleado = false;
    this.aplicarDescuentoPrestamo = false;
    this.previewData.set(null);
    // Volver al diálogo de retiro
    this.mostrarDialogoRetiro = true;
  }
  
  establecerMontoCompleto() {
    this.montoRetiro = this.saldoData()?.available_balance || 0;
    this.validarMontoRetiro();
  }
  
  validarMontoRetiro() {
    this.errorRetiro.set('');
    
    if (!this.montoRetiro || this.montoRetiro <= 0) {
      this.errorRetiro.set('El monto debe ser mayor a 0');
      return;
    }
    
    const saldoDisponible = this.saldoData()?.available_balance || 0;
    if (this.montoRetiro > saldoDisponible) {
      this.errorRetiro.set('El monto excede el saldo disponible');
      return;
    }
    
    // Límite por retiro individual
    if (this.montoRetiro > 100000) {
      this.errorRetiro.set('El monto máximo por retiro es RD$100,000');
      return;
    }
    
    // Límite diario (se validará en backend, pero informar al usuario)
    if (this.montoRetiro > 10000) {
      this.errorRetiro.set('El límite diario es RD$10,000. Verifique si ya ha retirado hoy.');
      return;
    }
  }
  
  confirmarRetiro() {
    if (!this.employeeId || !this.montoRetiro || this.errorRetiro()) {
      return;
    }
    
    this.procesandoRetiro.set(true);
    
    // PUNTO 3: Incluir información de préstamos en el payload
    const payload = {
      employee_id: this.employeeId,
      withdraw_amount: this.montoRetiro,
      employee_acceptance: this.aceptacionEmpleado,
      apply_loan_deduction: this.aplicarDescuentoPrestamo // NUEVO: Solo intención, no monto
    };
    
    console.log('RETIRO CON PREVIEW PAYLOAD:', payload);
    console.log('Aplicar descuento préstamo:', this.aplicarDescuentoPrestamo);
    
    this.pagosService.retirarComisionConAceptacion(payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Retiro Exitoso',
          detail: `Retiro de ${this.formatearMoneda(this.montoRetiro)} procesado correctamente`,
          life: 5000
        });
        
        // Actualizar saldo inmediatamente con balance_after
        if (response.balance_after !== undefined) {
          const currentData = this.saldoData();
          if (currentData) {
            currentData.available_balance = response.balance_after;
            this.saldoData.set({...currentData});
          }
        }
        
        // Imprimir recibo ON_DEMAND
        this.imprimirReciboOnDemand(response);
        
        this.cerrarDialogoRetiro();
        // Limpiar datos de preview
        this.previewData.set(null);
        this.aplicarDescuentoPrestamo = false;
        
        // Recargar saldo completo para sincronizar
        setTimeout(() => {
          this.cargarSaldo();
        }, 1000);
        this.procesandoRetiro.set(false);
      },
      error: (error) => {
        console.error('Error en retiro:', error);
        console.error('Error response:', error.error);
        console.error('Error status:', error.status);
        
        let errorMessage = 'Error al procesar retiro';
        if (error.status === 400) {
          errorMessage = error.error?.error || 'Datos inválidos para el retiro';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar retiros';
        } else if (error.status === 404) {
          errorMessage = 'Empleado no encontrado';
        }
        
        // Manejar errores específicos de antifraude
        if (error.status === 400 && error.error) {
          const errorData = error.error;
          
          // Límite diario
          if (errorData.daily_limit) {
            errorMessage = `Límite diario excedido. Ya retirado hoy: $${errorData.daily_withdrawn?.toFixed(2) || '0.00'}. Restante: $${errorData.remaining_daily?.toFixed(2) || '0.00'}`;
          }
          // Cooldown
          else if (errorData.cooldown_remaining_seconds) {
            const minutes = Math.ceil(errorData.cooldown_remaining_seconds / 60);
            errorMessage = `Debe esperar ${minutes} minuto(s) antes del próximo retiro`;
          }
          // Aceptación requerida
          else if (errorData.employee_acceptance_required) {
            errorMessage = 'Debe confirmar la aceptación del empleado para procesar el retiro';
          }
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error en Retiro',
          detail: errorMessage,
          life: 8000  // Más tiempo para leer errores de antifraude
        });
        
        this.procesandoRetiro.set(false);
      }
    });
  }
  
  imprimirReciboOnDemand(data: any) {
    const fechaRetiro = new Date(data.created_at || new Date());
    const contenido = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px;">
          <h2 style="color: #333; margin: 0; font-size: 18px;">RECIBO DE RETIRO DE COMISIÓN</h2>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">(ON_DEMAND)</p>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">#${data.withdraw_id || 'RET-' + Date.now()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px;">DETALLE</h3>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Empleado:</strong> ${data.employee?.full_name || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Fecha y hora:</strong> ${fechaRetiro.toLocaleDateString('es-ES')} ${fechaRetiro.toLocaleTimeString('es-ES')}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Monto retirado:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Método de pago:</strong> ${this.getMetodoLabel(data.payment_method || 'cash')}</p>
          ${data.payment_reference ? `<p style="margin: 5px 0; font-size: 12px;"><strong>Referencia:</strong> ${data.payment_reference}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px;">ESTADO FINANCIERO</h3>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Balance antes del retiro:</strong> $${data.balance_before?.toFixed(2) || '0.00'}</p>
          <p style="margin: 5px 0; font-size: 12px;"><strong>Balance retirado:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p style="margin: 5px 0; font-size: 12px; color: #28a745;"><strong>Balance restante:</strong> $${data.balance_after?.toFixed(2) || '0.00'}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-size: 12px;"><strong>Procesado por:</strong> ${data.processed_by || 'Sistema'}</p>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 15px;">
          <p style="font-size: 10px; color: #666; text-align: center; margin: 5px 0;">
            Este retiro corresponde a comisiones ya generadas por ventas realizadas.
          </p>
          <div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="font-size: 10px; color: #666; margin: 0;">Firma del empleado:</p>
            <div style="height: 30px; border-bottom: 1px solid #ccc; margin-top: 5px;"></div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 10px;">Recibo generado automáticamente</p>
        </div>
      </div>
    `;
    
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Recibo Retiro ON_DEMAND - ${data.employee?.full_name || 'Empleado'}</title>
            <meta charset="UTF-8">
          </head>
          <body>
            ${contenido}
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      ventana.document.close();
    }
  }
  
  getMetodoLabel(metodo: string): string {
    const labels: any = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'check': 'Cheque',
      'other': 'Otro'
    };
    return labels[metodo] || metodo;
  }
}