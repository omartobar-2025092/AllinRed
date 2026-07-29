import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllClientes,
  getClienteById,
  getClienteByEmail,
  createCliente,
  updateCliente,
  deleteCliente,
  getTotalClientes,
  searchClientesByName,
} from '../services/clienteService';
import { createClienteSchema, updateClienteSchema } from '../schemas/schemas';
import { ValidationError } from '../models/models';

const router = Router();

// ===== Rutas fijas (sin parámetros) deben ir primero =====
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nombre = req.query.nombre as string;
    if (!nombre || nombre.trim().length === 0) throw new ValidationError('El parámetro "nombre" es requerido');
    const clientes = await searchClientesByName(nombre);
    res.json({ success: true, data: clientes, message: `Se encontraron ${clientes.length} clientes` });
  } catch (error) { next(error); }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await getTotalClientes();
    res.json({ success: true, data: { totalClientes: total } });
  } catch (error) { next(error); }
});

// ===== Rutas con parámetros =====
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientes = await getAllClientes();
    res.json({ success: true, data: clientes, message: `Se encontraron ${clientes.length} clientes` });
  } catch (error) { next(error); }
});

// Tipar `params` con { id: string }
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const cliente = await getClienteById(id);
    res.json({ success: true, data: cliente });
  } catch (error) { next(error); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createClienteSchema.parse(req.body);
    const cliente = await createCliente(validatedData);
    res.status(201).json({ success: true, data: cliente, message: 'Cliente creado exitosamente' });
  } catch (error) { next(error); }
});

router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const validatedData = updateClienteSchema.parse(req.body);
    const cliente = await updateCliente(id, validatedData);
    res.json({ success: true, data: cliente, message: 'Cliente actualizado exitosamente' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    await deleteCliente(id);
    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (error) { next(error); }
});

export default router;