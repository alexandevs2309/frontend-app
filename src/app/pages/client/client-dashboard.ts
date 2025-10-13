import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Client Dashboard - Barbershop</h5>
                    <p>Panel de administración para barbería</p>
                    
                    <div class="grid">
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                                <div class="flex justify-content-between mb-3">
                                    <div>
                                        <span class="block text-500 font-medium mb-3">Citas Hoy</span>
                                        <div class="text-900 font-medium text-xl">12</div>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                                        <i class="pi pi-calendar text-blue-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                                <div class="flex justify-content-between mb-3">
                                    <div>
                                        <span class="block text-500 font-medium mb-3">Ventas Hoy</span>
                                        <div class="text-900 font-medium text-xl">$1,245</div>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width:2.5rem;height:2.5rem">
                                        <i class="pi pi-dollar text-green-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                                <div class="flex justify-content-between mb-3">
                                    <div>
                                        <span class="block text-500 font-medium mb-3">Empleados</span>
                                        <div class="text-900 font-medium text-xl">8</div>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                                        <i class="pi pi-users text-orange-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12 md:col-6 lg:col-3">
                            <div class="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                                <div class="flex justify-content-between mb-3">
                                    <div>
                                        <span class="block text-500 font-medium mb-3">Productos</span>
                                        <div class="text-900 font-medium text-xl">156</div>
                                    </div>
                                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
                                        <i class="pi pi-box text-purple-500 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ClientDashboard {}