export interface Pedido{
    idPedido: number;
    idCliente: number;
    datePedido: Date;
    totalPrecio: number;
    idMetodo: number;
    idDireccion: number;
}

export interface PedidoConDetalles{
    nombreMetodo: string;
    calle: string;
    ciudad: string;
    productos: DetallePedidoConProducto[];
}

export interface DetallePedidoConProducto{
    cantidad: number;
    precioUnidad: number;
    nombreProducto: string;
}