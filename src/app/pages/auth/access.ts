import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-access',
    standalone: true,
    imports: [ButtonModule, RouterModule, RippleModule, ButtonModule],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden px-4">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20 flex flex-col items-center text-center" style="border-radius: 53px">
                        <div class="gap-4 flex flex-col items-center">
                            <div class="flex items-center gap-3 mb-2">
                                <img src="assets/logos/iso-auron.jpg" alt="Auron Suite" class="h-12 w-12 rounded-2xl object-contain shadow-sm" />
                                <div class="text-left">
                                    <div class="text-xs uppercase tracking-[0.22em] text-surface-500">Auron Suite</div>
                                    <div class="text-lg font-bold text-surface-900 dark:text-surface-0">Control de acceso</div>
                                </div>
                            </div>
                            <div class="flex justify-center items-center border-2 border-orange-500 rounded-full" style="width: 3.2rem; height: 3.2rem">
                                <i class="text-orange-500 pi pi-fw pi-lock text-2xl!"></i>
                            </div>
                            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-4xl lg:text-5xl mb-2">Acceso restringido</h1>
                            <span class="text-muted-color max-w-md mb-6">Tu cuenta no tiene permisos para entrar a esta seccion. Si crees que es un error, contacta al administrador del negocio.</span>
                            <div class="mb-4 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-orange-500/10">
                                <img src="assets/logos/iso-auron.jpg" alt="Auron Suite" class="h-16 w-16 rounded-2xl object-contain" />
                            </div>
                            <div class="col-span-12 mt-8 text-center">
                                <p-button label="Volver al panel" routerLink="/" severity="warn" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class Access {}
