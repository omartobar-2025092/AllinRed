import { getPool } from '../data/database';
import { Pedido, PedidoConDetalles, NotFoundError, DetallePedidoConProducto } from '../models/models';
import { CreatePedidoInput, DetallePedidoInput } from '../schemas/schemas';
import { RowDataPacket } from 'mysql2/promise';
import { getClienteById } from './clienteService';
import { getProductoById } from './productoService';

export async function getAllPedidos(): Promise<Pedido[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idPedido, idCliente, datePedido, totalPrecio, idMetodo, idDireccion FROM Pedido ORDER BY datePedido DESC'
  );
  return rows.map((row) => ({ ...row, datePedido: new Date(row.datePedido) })) as Pedido[];
}

export async function getPedidoById(id: number): Promise<Pedido> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idPedido, idCliente, datePedido, totalPrecio, idMetodo, idDireccion FROM Pedido WHERE idPedido = ?',
    [id]
  );
  if (rows.length === 0) throw new NotFoundError('Pedido');
  const pedido = rows[0];
  return { ...pedido, datePedido: new Date(pedido.datePedido) } as Pedido;
}

export async function getPedidoCompletoById(id: number): Promise<PedidoConDetalles> {
  const pool = getPool();
  const pedido = await getPedidoById(id);
  const [detallesRows] = await pool.query<RowDataPacket[]>(
    `SELECT dp.cantidad, dp.precioUnidad, p.nombreProducto
     FROM DetallePedido dp
     JOIN Producto p ON dp.idProducto = p.idProducto
     WHERE dp.idPedido = ?`,
    [id]
  );
  const [metodoRows] = await pool.query<RowDataPacket[]>(
    'SELECT nombreMetodo FROM MetodoPago WHERE idMetodo = ?',
    [pedido.idMetodo]
  );
  const [direccionRows] = await pool.query<RowDataPacket[]>(
    'SELECT calle, ciudad FROM Direccion WHERE idDireccion = ?',
    [pedido.idDireccion]
  );
  return {
    ...pedido,
    nombreMetodo: metodoRows[0]?.nombreMetodo || 'Desconocido',
    calle: direccionRows[0]?.calle || 'Desconocida',
    ciudad: direccionRows[0]?.ciudad || 'Desconocida',
    productos: detallesRows as DetallePedidoConProducto[],
  };
}

export async function createPedido(input: CreatePedidoInput): Promise<Pedido> {
  const pool = getPool();
  const { idCliente, idMetodo, idDireccion, detalles } = input;
  await getClienteById(idCliente);
  let totalPrecio = 0;
  const detallesValidados: Array<DetallePedidoInput & { precioUnidad: number }> = [];
  for (const detalle of detalles) {
    const producto = await getProductoById(detalle.idProducto);
    const precioUnidad = producto.precioProducto;
    totalPrecio += precioUnidad * detalle.cantidad;
    detallesValidados.push({ ...detalle, precioUnidad });
  }
  const now = new Date();
  const [result] = await pool.query(
    'INSERT INTO Pedido (idCliente, datePedido, totalPrecio, idMetodo, idDireccion) VALUES (?, ?, ?, ?, ?)',
    [idCliente, now, totalPrecio, idMetodo, idDireccion]
  );
  const pedidoId = (result as any).insertId;
  for (const detalle of detallesValidados) {
    await pool.query(
      'INSERT INTO DetallePedido (idPedido, idProducto, cantidad, precioUnidad) VALUES (?, ?, ?, ?)',
      [pedidoId, detalle.idProducto, detalle.cantidad, detalle.precioUnidad]
    );
  }
  return getPedidoById(pedidoId);
}

export async function updatePedido(id: number, input: Partial<CreatePedidoInput>): Promise<Pedido> {
  const pool = getPool();
  await getPedidoById(id);
  const updates: string[] = [];
  const values: any[] = [];
  if (input.idMetodo !== undefined) { updates.push('idMetodo = ?'); values.push(input.idMetodo); }
  if (input.idDireccion !== undefined) { updates.push('idDireccion = ?'); values.push(input.idDireccion); }
  if (updates.length === 0) return getPedidoById(id);
  values.push(id);
  await pool.query(`UPDATE Pedido SET ${updates.join(', ')} WHERE idPedido = ?`, values);
  return getPedidoById(id);
}

export async function deletePedido(id: number): Promise<void> {
  const pool = getPool();
  await getPedidoById(id);
  await pool.query('DELETE FROM DetallePedido WHERE idPedido = ?', [id]);
  await pool.query('DELETE FROM Pedido WHERE idPedido = ?', [id]);
}

export async function getPedidosByCliente(idCliente: number): Promise<Pedido[]> {
  const pool = getPool();
  await getClienteById(idCliente);
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idPedido, idCliente, datePedido, totalPrecio, idMetodo, idDireccion FROM Pedido WHERE idCliente = ? ORDER BY datePedido DESC',
    [idCliente]
  );
  return rows.map((row) => ({ ...row, datePedido: new Date(row.datePedido) })) as Pedido[];
}

export async function getPedidosStats(): Promise<{
  totalPedidos: number;
  totalVentas: number;
  promedioVenta: number;
}> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as totalPedidos, SUM(totalPrecio) as totalVentas, AVG(totalPrecio) as promedioVenta FROM Pedido'
  );
  return {
    totalPedidos: rows[0].totalPedidos || 0,
    totalVentas: rows[0].totalVentas || 0,
    promedioVenta: rows[0].promedioVenta || 0,
  };
}