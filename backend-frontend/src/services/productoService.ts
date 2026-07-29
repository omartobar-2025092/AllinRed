import { getPool } from '../data/database';
import { Producto, ProductoCompleto, NotFoundError } from '../models/models';
import { CreateProductoInput, UpdateProductoInput } from '../schemas/schemas';
import { RowDataPacket } from 'mysql2/promise';

export async function getAllProductos(): Promise<Producto[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idProducto, nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora FROM Producto'
  );
  return rows as Producto[];
}

export async function getProductoById(id: number): Promise<Producto> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idProducto, nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora FROM Producto WHERE idProducto = ?',
    [id]
  );
  if (rows.length === 0) throw new NotFoundError('Producto');
  return rows[0] as Producto;
}

export async function getProductoCompletoById(id: number): Promise<ProductoCompleto> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      p.idProducto,
      p.nombreProducto,
      p.precioProducto,
      p.Tipo,
      p.Desarrolladora_idDesarrolladora,
      d.nombreDesarrolladora,
      (SELECT GROUP_CONCAT(nombrePlataforma) FROM Plataforma JOIN Producto_has_Plataforma ON Plataforma.idPlataforma = Producto_has_Plataforma.Plataforma_idPlataforma WHERE Producto_has_Plataforma.Producto_idProducto = p.idProducto) AS plataformas,
      (SELECT GROUP_CONCAT(categoria) FROM Categoria JOIN Producto_has_Categoria ON Categoria.idCategoria = Producto_has_Categoria.Categoria_idCategoria WHERE Producto_has_Categoria.Producto_idProducto = p.idProducto) AS categorias,
      (SELECT GROUP_CONCAT(Idioma) FROM Idioma JOIN Producto_has_Idioma ON Idioma.idIdioma = Producto_has_Idioma.Idioma_idIdioma WHERE Producto_has_Idioma.Producto_idProducto = p.idProducto) AS idiomas
    FROM Producto p
    LEFT JOIN Desarrolladora d ON p.Desarrolladora_idDesarrolladora = d.idDesarrolladora
    WHERE p.idProducto = ?`,
    [id]
  );
  if (rows.length === 0) throw new NotFoundError('Producto');
  return rows[0] as ProductoCompleto;
}

export async function createProducto(input: CreateProductoInput): Promise<Producto> {
  const pool = getPool();
  const { nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora } = input;
  const [result] = await pool.query(
    'INSERT INTO Producto (nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora) VALUES (?, ?, ?, ?)',
    [nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora]
  );
  const insertId = (result as any).insertId;
  return getProductoById(insertId);
}

export async function updateProducto(id: number, input: UpdateProductoInput): Promise<Producto> {
  const pool = getPool();
  await getProductoById(id);
  const updates: string[] = [];
  const values: any[] = [];
  if (input.nombreProducto !== undefined) { updates.push('nombreProducto = ?'); values.push(input.nombreProducto); }
  if (input.precioProducto !== undefined) { updates.push('precioProducto = ?'); values.push(input.precioProducto); }
  if (input.Tipo !== undefined) { updates.push('Tipo = ?'); values.push(input.Tipo); }
  if (input.Desarrolladora_idDesarrolladora !== undefined) { updates.push('Desarrolladora_idDesarrolladora = ?'); values.push(input.Desarrolladora_idDesarrolladora); }
  if (updates.length === 0) return getProductoById(id);
  values.push(id);
  await pool.query(`UPDATE Producto SET ${updates.join(', ')} WHERE idProducto = ?`, values);
  return getProductoById(id);
}

export async function deleteProducto(id: number): Promise<void> {
  const pool = getPool();
  await getProductoById(id);
  await pool.query('DELETE FROM Producto WHERE idProducto = ?', [id]);
}

export async function getProductosByDesarrolladora(idDesarrolladora: number): Promise<Producto[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idProducto, nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora FROM Producto WHERE Desarrolladora_idDesarrolladora = ?',
    [idDesarrolladora]
  );
  return rows as Producto[];
}