import { z } from 'zod';

// ============== PRODUCTO ==============
export const createProductoSchema = z.object({
  nombreProducto: z.string().min(1, 'Nombre del producto requerido'),
  precioProducto: z.number().positive('El precio debe ser positivo'),
  Tipo: z.string().min(1, 'Tipo de producto requerido'),
  Desarrolladora_idDesarrolladora: z.number().int('ID debe ser entero'),
});
export const updateProductoSchema = createProductoSchema.partial();

// ============== CLIENTE ==============
export const createClienteSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});
export const updateClienteSchema = createClienteSchema.partial();

// ============== PEDIDO ==============
export const detallePedidoSchema = z.object({
  idProducto: z.number().int('ID de producto debe ser entero'),
  cantidad: z.number().int('Cantidad debe ser número entero').positive('Cantidad debe ser positiva'),
});
export const createPedidoSchema = z.object({
  idCliente: z.number().int('ID de cliente debe ser entero'),
  idMetodo: z.number().int('ID de método debe ser entero'),
  idDireccion: z.number().int('ID de dirección debe ser entero'),
  detalles: z.array(detallePedidoSchema).min(1, 'Debe incluir al menos un producto'),
});
export const updatePedidoSchema = createPedidoSchema.partial().extend({
  datePedido: z.date().optional(),
  totalPrecio: z.number().positive().optional(),
});

// ============== TIPOS INFERIDOS ==============
export type CreateProductoInput = z.infer<typeof createProductoSchema>;
export type UpdateProductoInput = z.infer<typeof updateProductoSchema>;
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export type CreatePedidoInput = z.infer<typeof createPedidoSchema>;
export type UpdatePedidoInput = z.infer<typeof updatePedidoSchema>;
export type DetallePedidoInput = z.infer<typeof detallePedidoSchema>; // ← Agregado