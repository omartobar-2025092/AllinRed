import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllProductos,
  getProductoById,
  getProductoCompletoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getProductosByDesarrolladora,
} from '../services/productoService';
import { createProductoSchema, updateProductoSchema } from '../schemas/schemas';
import { ValidationError } from '../models/models';

const router = Router();

// ===== Rutas fijas (sin parámetros) deben ir primero =====
// Esta ruta debe ir ANTES de /:id para que no la intercepte
router.get('/desarrolladora/:idDesarrolladora', async (req: Request<{ idDesarrolladora: string }>, res: Response, next: NextFunction) => {
  try {
    const idDesarrolladora = parseInt(req.params.idDesarrolladora, 10);
    if (isNaN(idDesarrolladora)) throw new ValidationError('ID debe ser un número válido');
    const productos = await getProductosByDesarrolladora(idDesarrolladora);
    res.json({ success: true, data: productos, message: `Se encontraron ${productos.length} productos de la desarrolladora` });
  } catch (error) { next(error); }
});

// ===== Rutas con parámetros =====
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productos = await getAllProductos();
    res.json({ success: true, data: productos, message: `Se encontraron ${productos.length} productos` });
  } catch (error) { next(error); }
});

// /:id/completo debe ir ANTES de /:id
router.get('/:id/completo', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const producto = await getProductoCompletoById(id);
    res.json({ success: true, data: producto });
  } catch (error) { next(error); }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const producto = await getProductoById(id);
    res.json({ success: true, data: producto });
  } catch (error) { next(error); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProductoSchema.parse(req.body);
    const producto = await createProducto(validatedData);
    res.status(201).json({ success: true, data: producto, message: 'Producto creado exitosamente' });
  } catch (error) { next(error); }
});

router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    const validatedData = updateProductoSchema.parse(req.body);
    const producto = await updateProducto(id, validatedData);
    res.json({ success: true, data: producto, message: 'Producto actualizado exitosamente' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ValidationError('ID debe ser un número válido');
    await deleteProducto(id);
    res.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) { next(error); }
});

export default router;