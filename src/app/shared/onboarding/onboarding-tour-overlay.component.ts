import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { OnboardingRuntimeState, OnboardingTourService } from './onboarding-tour.service';
import { I18nPipe } from '../../core/pipes/i18n.pipe';

@Component({
    selector: 'app-onboarding-tour-overlay',
    standalone: true,
    imports: [CommonModule, I18nPipe],
    host: {
        style: 'position: fixed; inset: 0; z-index: 2147483000;'
    },
    template: `
        <div *ngIf="state.active" class="onboarding-backdrop" [class.with-spotlight]="!!state.spotlightRect"></div>

        <div *ngIf="state.active && state.spotlightRect" class="onboarding-spotlight"
            [style.top.px]="state.spotlightRect.top"
            [style.left.px]="state.spotlightRect.left"
            [style.width.px]="state.spotlightRect.width"
            [style.height.px]="state.spotlightRect.height"
            [class.spotlight-circle]="state.spotlightRect.shape === 'circle'">
        </div>

        <aside *ngIf="state.active" class="onboarding-tooltip" [class.mobile]="isMobile">
            <header class="onboarding-tooltip-header">
                <div class="onboarding-tooltip-kicker">{{ 'onboarding.overlay.kicker' | t : 'Recorrido guiado' }}</div>
                <span class="onboarding-step-pill">{{ 'onboarding.overlay.step' | t : 'Paso' }} {{ state.stepIndex }} {{ 'onboarding.overlay.of' | t : 'de' }} {{ state.totalSteps }}</span>
            </header>
            <h3 class="onboarding-tooltip-title">{{ state.title }}</h3>
            <p class="onboarding-tooltip-description">{{ state.description }}</p>
            <div class="onboarding-progress-meta">
                <div class="onboarding-progress-track" aria-hidden="true">
                    <div class="onboarding-progress-fill" [style.width.%]="progressPercent"></div>
                </div>
                <span class="onboarding-progress-label">{{ progressPercent | number: '1.0-0' }}%</span>
            </div>
            <footer class="onboarding-tooltip-actions">
                <button type="button" class="onboarding-btn ghost" (click)="previous()" [disabled]="state.stepIndex <= 1">{{ 'onboarding.overlay.previous' | t : 'Anterior' }}</button>
                <button type="button" class="onboarding-btn primary" (click)="next()">
                    {{ state.stepIndex === state.totalSteps ? ('onboarding.overlay.finish' | t : 'Finalizar') : ('onboarding.overlay.next' | t : 'Siguiente') }}
                </button>
                <button type="button" class="onboarding-btn skip-link" (click)="skip()">{{ 'onboarding.overlay.skip' | t : 'Saltar tour' }}</button>
            </footer>
        </aside>
    `
})
export class OnboardingTourOverlayComponent implements OnInit, OnDestroy {
    state: OnboardingRuntimeState = {
        active: false,
        title: '',
        description: '',
        stepIndex: 0,
        totalSteps: 0,
        spotlightRect: null
    };
    isMobile = false;
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

    @HostListener('window:resize')
    onResize(): void {
        this.isMobile = window.innerWidth < 900;
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
}
