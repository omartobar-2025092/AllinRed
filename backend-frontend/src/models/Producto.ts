export interface Producto{
    idProducto: number;
    nombreProducto: string;
    precioProducto: number;
    Tipo: string;
    Desarrolladora_idDesarrolladora: number;
}

export interface ProductoCompleto{
    nombreDesarrolladora: string;
    plataformas: string;
    categorias: string;
    idiomas: string;
}