import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-error',
    imports: [ButtonModule, RippleModule, RouterModule, ButtonModule],
    standalone: true,
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden px-4">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(233, 30, 99, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20 flex flex-col items-center text-center" style="border-radius: 53px">
                        <div class="gap-4 flex flex-col items-center">
                            <div class="flex items-center gap-3 mb-2">
                                <img src="assets/logos/iso-auron.jpg" alt="Auron Suite" class="h-12 w-12 rounded-2xl object-contain shadow-sm" />
                                <div class="text-left">
                                    <div class="text-xs uppercase tracking-[0.22em] text-surface-500">Auron Suite</div>
                                    <div class="text-lg font-bold text-surface-900 dark:text-surface-0">Estado de plataforma</div>
                                </div>
                            </div>
                            <div class="flex justify-center items-center border-2 border-pink-500 rounded-full" style="height: 3.2rem; width: 3.2rem">
                                <i class="pi pi-fw pi-exclamation-circle text-2xl! text-pink-500"></i>
                            </div>
                            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-5xl mb-2">Algo salio mal</h1>
                            <span class="text-muted-color max-w-md mb-6">No pudimos completar esta accion en Auron Suite. Puedes volver al panel o intentar de nuevo en unos minutos.</span>
                            <div class="mb-4 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-pink-500/10">
                                <img src="assets/logos/iso-auron.jpg" alt="Auron Suite" class="h-16 w-16 rounded-2xl object-contain" />
                            </div>
                            <div class="col-span-12 mt-8 text-center">
                                <p-button label="Volver al inicio" routerLink="/" severity="danger" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class Error {}
