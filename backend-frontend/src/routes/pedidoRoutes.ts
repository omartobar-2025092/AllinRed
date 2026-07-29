import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllPedidos,
  getPedidoById,
  getPedidoCompletoById,
  createPedido,
  updatePedido,
  deletePedido,
  getPedidosByCliente,
  getPedidosStats,
} from '../services/pedidoService';
import { createPedidoSchema } from '../schemas/schemas';
import { ValidationError } from '../models/models';

const router = Router();

// ===== Rutas fijas (sin parámetros) deben ir primero =====
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getPedidosStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

// Esta ruta debe ir ANTES de /:id para que no la intercepte
router.get('/cliente/:idCliente', async (req: Request<{ idCliente: string }>, res: Response, next: NextFunction) => {
  try {
    const idCliente = parseInt(req.params.idCliente, 10);
    if (isNaN(idCliente)) throw new ValidationError('ID debe ser un número válido');
    const pedidos = await getPedidosByCliente(idCliente);
    res.json({ success: true, data: pedidos, message: `Se encontraron ${pedidos.length} pedidos del cliente` });
  } catch (error) { next(error); }
});

// ===== Rutas con parámetros =====
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pedidos = await getAllPedidos();
    res.json({ success: true, data: pedidos, message: `Se encontraron ${pedidos.length} pedidos` });
  } catch (error) { next(error); }
});

// /:id/completo debe ir ANTES de /:id para que no se confunda
router.get('/:id/completo', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const pedido = await getPedidoCompletoById(id);
    res.json({ success: true, data: pedido });
  } catch (error) { next(error); }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const pedido = await getPedidoById(id);
    res.json({ success: true, data: pedido });
  } catch (error) { next(error); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createPedidoSchema.parse(req.body);
    const pedido = await createPedido(validatedData);
    res.status(201).json({ success: true, data: pedido, message: 'Pedido creado exitosamente' });
  } catch (error) { next(error); }
});

router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const { idMetodo, idDireccion } = req.body;
    const updates: any = {};
    if (idMetodo !== undefined) {
      if (!Number.isInteger(idMetodo)) throw new ValidationError('idMetodo debe ser un número entero');
      updates.idMetodo = idMetodo;
    }
    if (idDireccion !== undefined) {
      if (!Number.isInteger(idDireccion)) throw new ValidationError('idDireccion debe ser un número entero');
      updates.idDireccion = idDireccion;
    }
    const pedido = await updatePedido(id, updates);
    res.json({ success: true, data: pedido, message: 'Pedido actualizado exitosamente' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    await deletePedido(id);
    res.json({ success: true, message: 'Pedido eliminado exitosamente' });
  } catch (error) { next(error); }
});

export default router;