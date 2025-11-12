import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'video-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      (onHide)="onClose()"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="video-modal"
      [style]="{ width: '90vw', maxWidth: '1000px' }">

      <!-- Header -->
      <ng-template pTemplate="header">
        <div class="flex items-center space-x-3">
          <i class="pi pi-play-circle text-2xl text-primary"></i>
          <span class="text-xl font-semibold">Demo de BarberPro</span>
        </div>
      </ng-template>

      <!-- Contenido del video -->
      <div class="video-container">
        <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          <!-- Loader -->
          <div *ngIf="!videoUrl" class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <i class="pi pi-spin pi-spinner text-4xl text-white opacity-80"></i>
          </div>

          <!-- Video Embed -->
          @if (videoUrl) {
            <iframe
              width="100%"
              height="100%"
              [src]="videoUrl"
              title="BarberPro Demo"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="w-full h-full">
            </iframe>
          }

          <!-- Fallback si no hay video -->
          @if (!videoUrl && !visible) {
            <div class="flex items-center justify-center h-full bg-linear-to-br from-purple-600 to-blue-600">
              <div class="text-center text-white">
                <i class="pi pi-video text-6xl mb-4 opacity-50"></i>
                <h3 class="text-2xl font-bold mb-2">Demo Próximamente</h3>
                <p class="text-lg opacity-80">Estamos preparando un video demo increíble para ti.</p>
                <p class="text-sm opacity-60 mt-4">Mientras tanto, explora nuestras características abajo ⬇️</p>
              </div>
            </div>
          }
        </div>

        <!-- Descripción -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-semibold text-lg mb-2">¿Qué verás en este demo?</h4>
          <ul class="space-y-2 text-gray-700">
            <li class="flex items-center space-x-2">
              <i class="pi pi-check-circle text-green-500"></i>
              <span>Sistema POS en acción con cálculo automático de comisiones</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="pi pi-check-circle text-green-500"></i>
              <span>Gestión de citas y calendario interactivo</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="pi pi-check-circle text-green-500"></i>
              <span>Panel de ganancias por empleado en tiempo real</span>
            </li>
            <li class="flex items-center space-x-2">
              <i class="pi pi-check-circle text-green-500"></i>
              <span>Reportes y métricas del negocio</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <ng-template pTemplate="footer">
        <div class="flex justify-between items-center w-full">
          <div class="text-sm text-gray-600">
            <i class="pi pi-clock mr-1"></i>
            Duración: 3 minutos
          </div>
          <div class="flex space-x-3">
            <p-button
              label="Cerrar"
              icon="pi pi-times"
              (onClick)="onClose()"
              severity="secondary"
              [outlined]="true">
            </p-button>
            <p-button
              label="Comenzar Prueba Gratis"
              icon="pi pi-arrow-right"
              (onClick)="startTrial()"
              class="bg-linear-to-r from-yellow-400 to-orange-500 border-0">
            </p-button>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    ::ng-deep .video-modal .p-dialog-content {
      padding: 0;
    }

    ::ng-deep .video-modal .p-dialog-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    ::ng-deep .video-modal .p-dialog-header .p-dialog-header-close {
      color: white;
    }

    ::ng-deep .video-modal .p-dialog-header .p-dialog-header-close:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .video-container {
      padding: 1.5rem;
    }

    .aspect-video {
      aspect-ratio: 16 / 9;
    }
  `]
})
export class VideoModal implements OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  videoUrl: SafeResourceUrl | null = null;
  private baseVideoUrl = 'https://www.youtube.com/embed/GSVYJ1KByY0?autoplay=1&mute=1';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      if (this.visible) {
        // Activa el video solo cuando el modal se muestra
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.baseVideoUrl);
      } else {
        // Limpia el iframe cuando se cierra (detiene el video)
        this.videoUrl = null;
      }
    }
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
    // Detener video
    this.videoUrl = null;
  }

  startTrial() {
    this.onClose();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
