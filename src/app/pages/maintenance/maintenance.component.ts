import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maintenance-container">
      <div class="maintenance-content">
        <div class="maintenance-icon">
          🔧
        </div>
        
        <h1 class="maintenance-title">
          Sistema en Mantenimiento
        </h1>
        
        <p class="maintenance-message">
          Estamos realizando mejoras para ofrecerte un mejor servicio.
          <br>
          Estaremos de vuelta pronto.
        </p>
        
        <div class="maintenance-time">
          <div class="time-box">
            <span class="time-number">{{ minutes }}</span>
            <span class="time-label">min</span>
          </div>
          <div class="time-separator">:</div>
          <div class="time-box">
            <span class="time-number">{{ seconds }}</span>
            <span class="time-label">seg</span>
          </div>
        </div>
        
        <div class="maintenance-info">
          <p>💡 <strong>Mientras tanto:</strong></p>
          <ul>
            <li>Guarda cualquier trabajo pendiente</li>
            <li>El sistema se reactivará automáticamente</li>
            <li>Tus datos están seguros</li>
          </ul>
        </div>
        
        <button class="retry-button" (click)="checkStatus()">
          <span *ngIf="!checking">🔄 Verificar Estado</span>
          <span *ngIf="checking">⏳ Verificando...</span>
        </button>
        
        <div class="maintenance-footer">
          <p>¿Necesitas ayuda? Contacta a <strong>soporte@barbersaas.com</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .maintenance-content {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
    }
    
    .maintenance-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: rotate 2s linear infinite;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .maintenance-title {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
    }
    
    .maintenance-message {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    
    .maintenance-time {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    
    .time-box {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .time-number {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }
    
    .time-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }
    
    .time-separator {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }
    
    .maintenance-info {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    
    .maintenance-info p {
      margin: 0 0 10px 0;
      font-weight: bold;
      color: #333;
    }
    
    .maintenance-info ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .maintenance-info li {
      color: #666;
      margin-bottom: 5px;
    }
    
    .retry-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
      margin-bottom: 20px;
    }
    
    .retry-button:hover {
      transform: translateY(-2px);
    }
    
    .retry-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .maintenance-footer {
      font-size: 14px;
      color: #999;
    }
    
    @media (max-width: 600px) {
      .maintenance-content {
        padding: 30px 20px;
      }
      
      .maintenance-title {
        font-size: 24px;
      }
      
      .maintenance-icon {
        font-size: 60px;
      }
    }
  `]
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  minutes = 15;
  seconds = 0;
  checking = false;
  private timerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startCountdown() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        // Tiempo agotado, verificar estado
        this.checkStatus();
      }
    });
  }

  checkStatus() {
    this.checking = true;
    
    // Simular verificación del estado
    setTimeout(() => {
      // Intentar recargar la página para ver si el mantenimiento terminó
      window.location.reload();
    }, 2000);
  }
}