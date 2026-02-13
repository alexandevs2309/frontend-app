import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../core/services/auth/auth.service';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { RoleService } from '../../core/services/role/role.service';
import { UIHelpers } from '../../shared/utils/ui-helpers';
import { DatePipe } from '@angular/common';

interface User {
    id?: number;
    email?: string;
    full_name?: string;
    role?: string;
    tenant?: number;
    tenant_name?: string;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string;
    password?: string;
    phone?: string;
}

@Component({
    selector: 'app-users-management',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, SelectModule, DialogModule, TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule, DatePipe],
    template: `
        <p-toolbar styleClass="mb-6 rounded-2xl shadow-lg border-0">
            <ng-template #start>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <i class="pi pi-users text-white"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">Usuarios</h2>
                        <p class="text-sm text-muted-color m-0">Gestiona todos los usuarios del sistema</p>
                    </div>
                </div>
            </ng-template>
            <ng-template #end>
                <div class="flex gap-2">
                    <p-select [(ngModel)]="selectedTenantFilter" [options]="tenantOptions()" optionLabel="name" optionValue="id" placeholder="Filtrar por Tenant" (onChange)="filterByTenant()" styleClass="w-48" />
                    <p-button 
                        label="Nuevo Usuario" 
                        icon="pi pi-plus" 
                        styleClass="bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-lg hover:shadow-xl transition-all"
                        (onClick)="openNew()" 
                    />
                    <p-button 
                        severity="danger" 
                        label="Eliminar" 
                        icon="pi pi-trash" 
                        outlined 
                        (onClick)="deleteSelectedUsers()" 
                        [disabled]="!selectedUsers || !selectedUsers.length" 
                    />
                </div>
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="users()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['email', 'full_name', 'role', 'tenant_name']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedUsers"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [loading]="loading()"
            styleClass="rounded-2xl overflow-hidden shadow-lg">
            <ng-template #caption>
                <div class="flex items-center justify-between p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <h5 class="m-0 font-bold text-lg">Gestionar Usuarios</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(dt, $event)" 
                            placeholder="Buscar..." 
                            class="rounded-xl border-2 focus:border-indigo-500"
                        />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="email" style="min-width:16rem">
                        Email
                        <p-sortIcon field="email" />
                    </th>
                    <th pSortableColumn="full_name" style="min-width:12rem">
                        Name
                        <p-sortIcon field="full_name" />
                    </th>
                    <th pSortableColumn="role" style="min-width:10rem">
                        Role
                        <p-sortIcon field="role" />
                    </th>
                    <th style="min-width:12rem">Tenant</th>
                    <th pSortableColumn="is_active" style="min-width:8rem">
                        Status
                        <p-sortIcon field="is_active" />
                    </th>
                    <th pSortableColumn="date_joined" style="min-width:12rem">
                        Joined
                        <p-sortIcon field="date_joined" />
                    </th>
                    <th style="min-width:12rem">Last Login</th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-user>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="user" />
                    </td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.full_name }}</td>
                    <td>
                        <p-tag [value]="user.role" [severity]="UIHelpers.getRoleSeverity(user.role)" />
                    </td>
                    <td>{{ user.tenant_name || 'N/A' }}</td>
                    <td>
                        <p-tag [value]="user.is_active ? 'Activo' : 'Inactivo'" [severity]="UIHelpers.getStatusSeverity(user.is_active)" />
                    </td>
                    <td>{{ user.date_joined | date: 'dd/MM/yyyy' }}</td>
                    <td>{{ user.last_login | date: 'dd/MM/yyyy' }}</td>
                    <td>
                        <div class="flex gap-2">
                            <p-button 
                                icon="pi pi-pencil" 
                                [rounded]="true" 
                                [outlined]="true" 
                                severity="info"
                                styleClass="hover:scale-110 transition-transform"
                                (click)="editUser(user)" 
                            />
                            <p-button 
                                icon="pi pi-trash" 
                                severity="danger" 
                                [rounded]="true" 
                                [outlined]="true" 
                                styleClass="hover:scale-110 transition-transform"
                                (click)="deleteUser(user)" 
                            />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="userDialog" [style]="{ width: '450px' }" header="User Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <input type="email" pInputText id="email" [(ngModel)]="user.email" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !user.email">Email is required.</small>
                    </div>

                    <div>
                        <label for="full_name" class="block font-bold mb-3">Full Name</label>
                        <input type="text" pInputText id="full_name" [(ngModel)]="user.full_name" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !user.full_name">Name is required.</small>
                    </div>

                    <div>
                        <label for="role" class="block font-bold mb-3">Role</label>
                        <p-select [(ngModel)]="user.role" inputId="role" [options]="roleOptions()" optionLabel="label" optionValue="value" placeholder="Select Role" fluid />
                    </div>

                    <div *ngIf="user.role === 'Client-Admin' || user.role === 'Client-Staff'">
                        <label for="tenant" class="block font-bold mb-3">Tenant</label>
                        <p-select [(ngModel)]="user.tenant" inputId="tenant" [options]="tenantOptions()" optionLabel="name" optionValue="id" placeholder="Select Tenant" fluid />
                        <small class="text-red-500" *ngIf="submitted && (user.role === 'Client-Admin' || user.role === 'Client-Staff') && !user.tenant">Tenant is required for this role.</small>
                    </div>

                    <div *ngIf="!user.id">
                        <label for="password" class="block font-bold mb-3">Password</label>
                        <input type="password" pInputText id="password" [(ngModel)]="user.password" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !user.password && !user.id">Password is required for new users.</small>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="is_active" [(ngModel)]="user.is_active" />
                        <label for="is_active">Active</label>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveUser()" [loading]="saving()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class UsersManagement implements OnInit {
    userDialog: boolean = false;
    users = signal<User[]>([]);
    tenantOptions = signal<any[]>([]);
    roleOptions = signal<any[]>([]);
    user!: User;
    selectedUsers!: User[] | null;
    selectedTenantFilter: number | null = null;
    submitted: boolean = false;
    loading = signal(false);
    saving = signal(false);

    constructor(
        private authService: AuthService,
        private tenantService: TenantService,
        private roleService: RoleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.loadTenants();
        this.loadRoles();
    }

    loadUsers() {
        this.loading.set(true);
        this.authService.getUsers().subscribe({
            next: (data: any) => {
                const users = Array.isArray(data) ? data : data.results || [];
                // Filtrar solo usuarios del tenant actual (excluir SuperAdmin)
                const filteredUsers = users.filter((user: any) => 
                    user.role && user.role !== 'SuperAdmin'
                );
                const mappedUsers = filteredUsers.map((user: any) => ({
                    ...user,
                    tenant_name: user.tenant?.name || user.tenant_name || 'N/A'
                }));
                this.users.set(mappedUsers);
                this.loading.set(false);
            },
            error: (error) => this.handleLoadUsersError(error)
        });
    }

    loadTenants() {
        const currentUser = this.authService.getCurrentUser();
        
        if (currentUser?.role === 'SuperAdmin') {
            // SuperAdmin puede ver todos los tenants
            this.tenantService.getTenants().subscribe({
                next: (data: any) => {
                    const tenants = Array.isArray(data) ? data : data.results || [];
                    const options = [{ name: 'All Tenants', id: null }, ...tenants.map((t: any) => ({ name: t.name, id: t.id }))];
                    this.tenantOptions.set(options);
                },
                error: (error) => this.handleLoadTenantsError(error)
            });
        } else {
            // Para Client-Admin, obtener tenant desde localStorage
            const tenantData = localStorage.getItem('tenant');
            if (tenantData) {
                try {
                    const tenant = JSON.parse(tenantData);
                    const options = [{ name: tenant.name, id: tenant.id }];
                    this.tenantOptions.set(options);
                } catch (error) {
                    console.error('Error parsing tenant data:', error);
                    this.tenantOptions.set([]);
                }
            } else {
                this.tenantOptions.set([]);
            }
        }
    }

    loadRoles() {
        this.roleService.getRoles().subscribe({
            next: (roles: any) => {
                const rolesArray = Array.isArray(roles) ? roles : roles.results || [];
                const options = rolesArray
                    .filter((r: any) => r.scope === 'TENANT')
                    .map((r: any) => ({ label: r.description || r.name, value: r.name }));
                this.roleOptions.set(options);
            },
            error: (error) => {
                console.error('Error loading roles:', error);
                this.roleOptions.set([]);
            }
        });
    }

    filterByTenant() {
        const currentUser = this.authService.getCurrentUser();
        
        if (currentUser?.role === 'SuperAdmin') {
            if (this.selectedTenantFilter) {
                this.authService.getUsers({ tenant: this.selectedTenantFilter }).subscribe({
                    next: (data: any) => {
                        const users = Array.isArray(data) ? data : data.results || [];
                        this.users.set(users);
                    },
                    error: (error) => this.handleFilterError(error)
                });
            } else {
                this.loadUsers();
            }
        } else {
            // Client-Admin siempre ve solo sus usuarios
            this.loadUsers();
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.user = { is_active: true, role: 'Client-Staff' };
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    deleteSelectedUsers() {
        if (!this.selectedUsers?.length) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected users?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.performBulkDelete()
        });
    }

    private performBulkDelete(): void {
        const userIds = this.selectedUsers!.map(u => u.id!).filter(id => id);
        this.authService.bulkDeleteUsers(userIds).subscribe({
            next: () => {
                this.loadUsers();
                this.selectedUsers = null;
                this.showSuccessMessage('Users Deleted');
            },
            error: (error) => this.showErrorMessage('Failed to delete users', error)
        });
    }

    deleteUser(user: User) {
        if (!user.id) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.email || 'this user'}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.performUserDelete(user.id!)
        });
    }

    private performUserDelete(userId: number): void {
        this.authService.deleteUser(userId).subscribe({
            next: () => {
                this.loadUsers();
                this.showSuccessMessage('User Deleted');
            },
            error: (error) => this.showErrorMessage('Failed to delete user', error)
        });
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;
        if (!this.isUserFormValid()) return;

        this.saving.set(true);

        if (this.user.id) {
            this.updateUser();
        } else if (this.userNeedsTenant()) {
            this.checkUserLimits();
        } else {
            this.createUser();
        }
    }

    checkUserLimits() {
        if (!this.user.tenant) {
            this.createUser();
            return;
        }

        // Usar datos del tenant desde localStorage si está disponible
        const tenantData = localStorage.getItem('tenant');
        if (tenantData && this.user.tenant) {
            try {
                const tenant = JSON.parse(tenantData);
                if (tenant.id === this.user.tenant) {
                    this.validateUserLimits(tenant);
                    return;
                }
            } catch (error) {
                console.error('Error parsing tenant data:', error);
            }
        }

        // Fallback a API call
        this.tenantService.getTenant(this.user.tenant).subscribe({
            next: (tenant: any) => this.validateUserLimits(tenant),
            error: () => {
                this.showErrorMessage('No se pudo verificar los límites del plan');
                this.saving.set(false);
            }
        });
    }

    private validateUserLimits(tenant: any): void {
        const currentUsers = this.getCurrentUserCount();
        const maxUsers = tenant.subscription_plan?.max_users || 0;

        if (this.isUserLimitExceeded(currentUsers, maxUsers)) {
            this.showUserLimitError(maxUsers);
            this.saving.set(false);
            return;
        }

        this.createUser();
    }

    private getCurrentUserCount(): number {
        return this.users().filter((u) => u.tenant === this.user.tenant && u.is_active).length;
    }

    createUser() {
        const userData = {
            email: this.user.email!,
            full_name: this.user.full_name!,
            role: this.user.role,
            tenant: this.user.tenant || undefined,
            is_active: this.user.is_active ?? true,
            password: this.user.password!
        };

        this.authService.createUser(userData).subscribe({
            next: (newUser) => {
                this.users.set([...this.users(), newUser]);
                this.showSuccessMessage('User Created');
                this.closeDialog();
            },
            error: (error) => {
                this.showErrorMessage('Failed to create user', error);
                this.saving.set(false);
            }
        });
    }

    private isUserLimitExceeded(currentUsers: number, maxUsers: number): boolean {
        return maxUsers > 0 && currentUsers >= maxUsers;
    }

    private showUserLimitError(maxUsers: number): void {
        const sanitizedMaxUsers = Math.max(0, Math.floor(maxUsers));
        this.messageService.add({
            severity: 'error',
            summary: 'Límite Alcanzado',
            detail: `El tenant ha alcanzado el límite de ${sanitizedMaxUsers} usuarios activos`,
            life: 5000
        });
    }

    private isUserFormValid(): boolean {
        return !!this.user.email?.trim() && !!this.user.full_name?.trim() && (!!this.user.id || !!this.user.password?.trim()) && (!this.userNeedsTenant() || !!this.user.tenant);
    }

    private userNeedsTenant(): boolean {
        return this.user.role === 'Client-Admin' || this.user.role === 'Client-Staff';
    }

    private updateUser(): void {
        const updateData: any = {
            email: this.user.email,
            full_name: this.user.full_name,
            role: this.user.role,
            tenant: this.user.tenant || undefined,
            is_active: this.user.is_active ?? true
        };

        // No incluir password en updates
        // Solo incluir phone si existe
        if (this.user.phone) {
            updateData.phone = this.user.phone;
        }

        this.authService.updateUser(this.user.id!, updateData).subscribe({
            next: (updatedUser) => {
                this.updateUserInList(updatedUser);
                this.showSuccessMessage('User Updated');
                this.closeDialog();
            },
            error: (error) => {
                console.error('Update user error:', error);
                this.showErrorMessage('Failed to update user', error);
                this.saving.set(false);
            }
        });
    }

    private updateUserInList(updatedUser: User): void {
        const users = [...this.users()];
        const index = users.findIndex((u) => u.id === this.user.id);
        if (index !== -1) {
            users[index] = updatedUser;
            this.users.set(users);
        }
    }

    private showSuccessMessage(detail: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail,
            life: 3000
        });
    }

    private showErrorMessage(message: string, error?: any): void {
        this.logError(message, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.sanitizeErrorMessage(error, message),
            life: 3000
        });
    }

    private closeDialog(): void {
        this.userDialog = false;
        this.saving.set(false);
    }

    private handleLoadUsersError(error: any): void {
        this.logError('Failed to load users', error);
        this.users.set([]);
        this.loading.set(false);
    }

    private handleLoadTenantsError(error: any): void {
        this.logError('Failed to load tenants', error);
        this.tenantOptions.set([{ name: 'All Tenants', id: null }]);
    }

    private handleFilterError(error: any): void {
        this.logError('Failed to filter users', error);
        this.users.set([]);
    }

    private sanitizeErrorMessage(error: any, fallback: string): string {
        const errorMessage = error?.error?.message || error?.message;
        return typeof errorMessage === 'string' ? errorMessage.substring(0, 200) : fallback;
    }

    private logError(context: string, error: any): void {
        const errorInfo = {
            context,
            timestamp: new Date().toISOString(),
            error: error?.message || 'Unknown error',
            component: 'UsersManagement'
        };
        console.warn('[UsersManagement Error]', errorInfo);
    }

    UIHelpers = UIHelpers;
}
