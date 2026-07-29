import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './data/database';
import { AppError } from './models/models';
import productoRoutes from './routes/productoRoutes';
import clienteRoutes from './routes/clienteRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import { ZodError } from 'zod';


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let details: any;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } 
  else if (error?.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Registro duplicado';
  } 
  else if (error?.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 409;
    message = 'Referencia inválida';
  } 
  else if (error instanceof Error) {
    message = error.message;
  }

  // Si hay detalles adicionales (ej. errores de validación)
  if (error?.errors && Array.isArray(error.errors)) {
    details = error.errors.map((err: any) => ({
      path: err.path?.join('.') || err.field,
      message: err.message
    }));
  }

  const response: any = { success: false, message };
  if (details) response.details = details;

  res.status(statusCode).json(response);
});

async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });

    const shutdown = async () => {
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();

export default app;