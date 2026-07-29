// ============== PRODUCTO ==============
export interface Producto {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  Tipo: string;
  Desarrolladora_idDesarrolladora: number;
}

export interface ProductoCompleto extends Producto {
  nombreDesarrolladora: string;
  plataformas: string;
  categorias: string;
  idiomas: string;
}

// ============== CLIENTE ==============
export interface Cliente {
  idCliente: number;
  nombre: string;
  email: string;
  dateRegistro: Date;
}

export interface CreateClienteInput {
  nombre: string;
  email: string;
}

// ============== PEDIDO ==============
export interface Pedido {
  idPedido: number;
  idCliente: number;
  datePedido: Date;
  totalPrecio: number;
  idMetodo: number;
  idDireccion: number;
}

export interface PedidoConDetalles extends Pedido {
  nombreMetodo: string;
  calle: string;
  ciudad: string;
  productos: DetallePedidoConProducto[];
}

export interface DetallePedidoConProducto {
  cantidad: number;
  precioUnidad: number;
  nombreProducto: string;
}

export interface CreatePedidoInput {
  idCliente: number;
  idMetodo: number;
  idDireccion: number;
  detalles: DetallePedidoInput[];
}

export interface DetallePedidoInput {
  idProducto: number;
  cantidad: number;
}

// ============== ERRORES PERSONALIZADOS ==============
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}
