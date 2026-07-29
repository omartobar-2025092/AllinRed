import { getPool } from '../data/database';
import { Cliente, NotFoundError } from '../models/models';
import { CreateClienteInput, UpdateClienteInput } from '../schemas/schemas';
import { RowDataPacket } from 'mysql2/promise';

// ============================================
// EXPORTAR TODAS LAS FUNCIONES (con `export`)
// ============================================

export async function getAllClientes(): Promise<Cliente[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idCliente, nombre, email, dateRegistro FROM Cliente ORDER BY dateRegistro DESC'
  );
  return rows.map((row) => ({
    ...row,
    dateRegistro: new Date(row.dateRegistro),
  })) as Cliente[];
}

export async function getClienteById(id: number): Promise<Cliente> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idCliente, nombre, email, dateRegistro FROM Cliente WHERE idCliente = ?',
    [id]
  );
  if (rows.length === 0) throw new NotFoundError('Cliente');
  const cliente = rows[0];
  return { ...cliente, dateRegistro: new Date(cliente.dateRegistro) } as Cliente;
}

export async function getClienteByEmail(email: string): Promise<Cliente | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idCliente, nombre, email, dateRegistro FROM Cliente WHERE email = ?',
    [email]
  );
  if (rows.length === 0) return null;
  const cliente = rows[0];
  return { ...cliente, dateRegistro: new Date(cliente.dateRegistro) } as Cliente;
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  const pool = getPool();
  const { nombre, email } = input;
  const existing = await getClienteByEmail(email);
  if (existing) throw new Error(`El email ${email} ya está registrado`);
  const now = new Date();
  const [result] = await pool.query(
    'INSERT INTO Cliente (nombre, email, dateRegistro) VALUES (?, ?, ?)',
    [nombre, email, now]
  );
  const insertId = (result as any).insertId;
  return getClienteById(insertId);
}

export async function updateCliente(id: number, input: UpdateClienteInput): Promise<Cliente> {
  const pool = getPool();
  await getClienteById(id);
  if (input.email !== undefined) {
    const existing = await getClienteByEmail(input.email);
    if (existing && existing.idCliente !== id) throw new Error(`El email ${input.email} ya está registrado`);
  }
  const updates: string[] = [];
  const values: any[] = [];
  if (input.nombre !== undefined) { updates.push('nombre = ?'); values.push(input.nombre); }
  if (input.email !== undefined) { updates.push('email = ?'); values.push(input.email); }
  if (updates.length === 0) return getClienteById(id);
  values.push(id);
  await pool.query(`UPDATE Cliente SET ${updates.join(', ')} WHERE idCliente = ?`, values);
  return getClienteById(id);
}

export async function deleteCliente(id: number): Promise<void> {
  const pool = getPool();
  await getClienteById(id);
  await pool.query('DELETE FROM Cliente WHERE idCliente = ?', [id]);
}

export async function getTotalClientes(): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM Cliente');
  return rows[0].total;
}

export async function searchClientesByName(name: string): Promise<Cliente[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idCliente, nombre, email, dateRegistro FROM Cliente WHERE nombre LIKE ? ORDER BY nombre',
    [`%${name}%`]
  );
  return rows.map((row) => ({ ...row, dateRegistro: new Date(row.dateRegistro) })) as Cliente[];
}