// Módulo de Pagos a Empleados
// Centraliza toda la lógica de pagos, liquidaciones y administración

export { PagosEmpleados } from './pagos-empleados';
export { AdministracionPagos } from './administracion-pagos';
export { HistorialPagos } from './historial-pagos';
export { ConfiguracionPagos } from './configuracion-pagos';
export { PagosService } from './services/pagos.service';

// Interfaces exportadas
export type { PagoEmpleado, HistorialPago, ConfiguracionPago } from './services/pagos.service';