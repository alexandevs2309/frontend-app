import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DecimalPipe, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';
import { OnboardingRuntimeState, OnboardingTourService } from './onboarding-tour.service';
import { I18nPipe } from '../../core/pipes/i18n.pipe';
import { OnboardingTooltipPlacement } from './onboarding.config';

@Component({
    selector: 'app-onboarding-tour-overlay',
    standalone: true,
    imports: [DecimalPipe, I18nPipe, NgStyle],
    styleUrl: './onboarding.styles.scss',
    host: {
        style: 'position: fixed; inset: 0; z-index: 2147483000;'
    },
    template: `
        @if (state.active) {
        <div class="onboarding-backdrop" [class.with-spotlight]="!!state.spotlightRect"></div>
        }

        @if (state.active && state.spotlightRect) {
        <div class="onboarding-spotlight"
            [style.top.px]="state.spotlightRect.top"
            [style.left.px]="state.spotlightRect.left"
            [style.width.px]="state.spotlightRect.width"
            [style.height.px]="state.spotlightRect.height"
            [class.spotlight-circle]="state.spotlightRect.shape === 'circle'">
        </div>
        }

        @if (state.active) {
        <aside class="onboarding-tooltip" [class.mobile]="isMobile" [class]="tourVisual.className" [ngStyle]="tooltipStyle">
            <header class="onboarding-tooltip-header">
                <div>
                    <div class="onboarding-tooltip-kicker">
                        <i [class]="tourVisual.icon"></i>
                        <span>{{ tourVisual.eyebrow }}</span>
                    </div>
                    <div class="onboarding-tooltip-tour-name">{{ state.tourName }}</div>
                    <div class="onboarding-tooltip-step-meta">{{ 'onboarding.overlay.step' | t : 'Paso' }} {{ state.stepIndex }} {{ 'onboarding.overlay.of' | t : 'de' }} {{ state.totalSteps }}</div>
                </div>
                <div class="onboarding-tooltip-header-actions">
                    <span class="onboarding-step-pill">{{ progressPercent | number: '1.0-0' }}%</span>
                    <button type="button" class="onboarding-close" (click)="skip()" aria-label="Cerrar recorrido">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            </header>
            <h3 class="onboarding-tooltip-title">{{ state.title }}</h3>
            <p class="onboarding-tooltip-description">{{ state.description }}</p>
            <div class="onboarding-tour-hint">{{ tourVisual.hint }}</div>
            <div class="onboarding-progress-meta">
                <div class="onboarding-progress-track" aria-hidden="true">
                    <div class="onboarding-progress-fill" [style.width.%]="progressPercent"></div>
                </div>
                <span class="onboarding-progress-label">{{ state.stepIndex }}/{{ state.totalSteps }}</span>
            </div>
            <footer class="onboarding-tooltip-actions">
                <button type="button" class="onboarding-btn ghost" (click)="previous()" [disabled]="state.stepIndex <= 1">{{ 'onboarding.overlay.previous' | t : 'Anterior' }}</button>
                <button type="button" class="onboarding-btn primary" (click)="next()">
                    {{ state.stepIndex === state.totalSteps ? ('onboarding.overlay.finish' | t : 'Finalizar') : ('onboarding.overlay.next' | t : 'Siguiente') }}
                </button>
                <button type="button" class="onboarding-btn skip-link" (click)="skip()">{{ 'onboarding.overlay.skip' | t : 'Saltar tour' }}</button>
            </footer>
            <div class="onboarding-shortcuts">
                <span><kbd>Enter</kbd> avanzar</span>
                <span><kbd>Esc</kbd> cerrar</span>
                <span><kbd>←</kbd><kbd>→</kbd> navegar</span>
            </div>
        </aside>
        }
    `
})
export class OnboardingTourOverlayComponent implements OnInit, OnDestroy {
    state: OnboardingRuntimeState = {
        active: false,
        tourId: '',
        tourName: '',
        title: '',
        description: '',
        stepIndex: 0,
        totalSteps: 0,
        placement: 'bottom-right',
        spotlightRect: null
    };
    isMobile = false;
    tooltipStyle: Record<string, string> = {};
    private readonly subscription = new Subscription();
    @HostBinding('style.pointer-events') get hostPointerEvents(): string {
        return this.state.active ? 'auto' : 'none';
    }

    constructor(
        private readonly onboardingTourService: OnboardingTourService,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly renderer: Renderer2
    ) {}

    ngOnInit(): void {
        const host = this.elementRef.nativeElement;
        if (host.parentElement !== document.body) {
            this.renderer.appendChild(document.body, host);
        }
        this.isMobile = window.innerWidth < 900;
        this.subscription.add(this.onboardingTourService.state$.subscribe((state) => {
            this.state = state;
            this.tooltipStyle = this.computeTooltipStyle(state);
        }));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    get progressPercent(): number {
        if (!this.state.totalSteps) {
            return 0;
        }
        return (this.state.stepIndex / this.state.totalSteps) * 100;
    }

    get tourVisual(): { icon: string; eyebrow: string; className: string; hint: string } {
        if (this.state.tourId.includes('pos')) {
            return {
                icon: 'pi pi-shopping-cart',
                eyebrow: 'Flujo de venta',
                className: 'tour-pos',
                hint: 'Validaremos caja, venta y cierre sin perder el hilo operativo.'
            };
        }

        if (this.state.tourId.includes('earnings')) {
            return {
                icon: 'pi pi-wallet',
                eyebrow: 'Gestion de pagos',
                className: 'tour-earnings',
                hint: 'Este recorrido te orienta en periodos, aprobacion y pagos.'
            };
        }

        if (this.state.tourId.includes('ops')) {
            return {
                icon: 'pi pi-compass',
                eyebrow: 'Operacion diaria',
                className: 'tour-ops',
                hint: 'Usa este tour para moverte mas rapido por las tareas del dia.'
            };
        }

        return {
            icon: 'pi pi-sparkles',
            eyebrow: 'Configuracion inicial',
            className: 'tour-main',
            hint: 'Te guiaremos por el orden correcto para arrancar mejor.'
        };
    }

    @HostListener('window:resize')
    onResize(): void {
        this.isMobile = window.innerWidth < 900;
        this.tooltipStyle = this.computeTooltipStyle(this.state);
    }

    @HostListener('window:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (!this.state.active) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            this.skip();
        } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
            event.preventDefault();
            this.next();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.previous();
        }
    }

    next(): void {
        this.onboardingTourService.next();
    }

    previous(): void {
        this.onboardingTourService.previous();
    }

    skip(): void {
        this.onboardingTourService.skip();
    }

    private computeTooltipStyle(state: OnboardingRuntimeState): Record<string, string> {
        if (!state.active || this.isMobile || !state.spotlightRect) {
            return {};
        }

        const rect = state.spotlightRect;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const panelWidth = Math.min(420, vw - 32);
        const panelHeight = 250;
        const gap = 18;

        let top = vh - panelHeight - 20;
        let left = vw - panelWidth - 20;

        switch (state.placement as OnboardingTooltipPlacement) {
            case 'top-left':
                top = rect.top - panelHeight - gap;
                left = rect.left;
                break;
            case 'top-right':
                top = rect.top - panelHeight - gap;
                left = rect.left + rect.width - panelWidth;
                break;
            case 'bottom-left':
                top = rect.top + rect.height + gap;
                left = rect.left;
                break;
            case 'bottom-right':
            default:
                top = rect.top + rect.height + gap;
                left = rect.left + rect.width - panelWidth;
                break;
        }

        top = Math.max(16, Math.min(top, vh - panelHeight - 16));
        left = Math.max(16, Math.min(left, vw - panelWidth - 16));

        return {
            top: `${top}px`,
            left: `${left}px`,
            right: 'auto',
            bottom: 'auto',
            width: `${panelWidth}px`
        };
    }
}
