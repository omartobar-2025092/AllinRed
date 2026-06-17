Drop Database if exists AllinRed_in5cm;
Create Database AllinRed_in5cm;
Use AllinRed_in5cm;

Create Table Desarrolladora(
idDesarrolladora Int primary key auto_increment,
nombreDesarrolladora Varchar(45) not null
);

Create Table Cliente(
idCliente Int primary key auto_increment,
nombre Varchar(45) not null,
email Varchar(45) unique not null,
dateRegistro Date not null
);

Create Table Direccion(
idDireccion Int primary key auto_increment,
calle Varchar(45) not null,
ciudad Varchar(45) not null,
codigoPostal Varchar(45) not null,
direccionLocal Varchar(45),
idCliente Int not null,
Foreign Key (idCliente) References Cliente(idCliente)
	On delete cascade
    On update cascade
);

Create Table MetodoPago(
idMetodo Int primary key auto_increment,
nombreMetodo Varchar(45) not null unique
);

Create Table Producto(
idProducto Int primary key auto_increment,
nombreProducto Varchar(45) not null,
precioProducto Int not null,
tipo Varchar(45) not null,
Desarrolladora_idDesarrolladora int not null,
    Foreign Key (Desarrolladora_idDesarrolladora) References Desarrolladora(idDesarrolladora)
	On delete restrict
    On update cascade
);

Create Table Pedido(
idPedido Int primary key auto_increment,
datePedido Date not null,
totalPrecio Int not null,
idCliente int not null,
idMetodo int not null,
idDireccion int not null,
Foreign Key (idCliente) References Cliente(idCliente)
On delete cascade
On update cascade,
Foreign Key (idMetodo) References MetodoPago(idMetodo)
On delete restrict
On update cascade,
Foreign Key (idDireccion) References Direccion(idDireccion)
On delete restrict
On update cascade
);

Create Table DetallePedido(
idDetalle Int primary key auto_increment,
cantidad Int not null check (cantidad > 0 ),
precioUnidad Int not null,
idPedido int not null,
idProducto int not null,
Foreign Key (idPedido) References Pedido(idPedido)
On delete cascade
On update cascade,
Foreign Key (idProducto) References Producto(idProducto)
On delete restrict
On update cascade
);

Create Table Plataforma(
idPlataforma Int primary key auto_increment,
nombrePlataforma Varchar(45) not null unique,
fabricante Varchar(45) not null
);

Create Table Categoria(
idCategoria Int primary key auto_increment,
categoria Varchar(45) not null
);

create Table Idioma(
idIdioma Int primary key auto_increment,
idioma Varchar(45) not null unique,
codigo Varchar(45) not null unique
);

-- Tablas puente --

CREATE TABLE Producto_has_Plataforma (
    Producto_idProducto INT NOT NULL,
    Plataforma_idPlataforma INT NOT NULL,
    PRIMARY KEY (Producto_idProducto, Plataforma_idPlataforma),
    FOREIGN KEY (Producto_idProducto) REFERENCES Producto(idProducto)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Plataforma_idPlataforma) REFERENCES Plataforma(idPlataforma)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Producto_has_Categoria (
    Producto_idProducto INT NOT NULL,
    Categoria_idCategoria INT NOT NULL,
    PRIMARY KEY (Producto_idProducto, Categoria_idCategoria),
    FOREIGN KEY (Producto_idProducto) REFERENCES Producto(idProducto)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Categoria_idCategoria) REFERENCES Categoria(idCategoria)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Producto_has_Idioma (
    Producto_idProducto INT NOT NULL,
    Idioma_idIdioma INT NOT NULL,
    PRIMARY KEY (Producto_idProducto, Idioma_idIdioma),
    FOREIGN KEY (Producto_idProducto) REFERENCES Producto(idProducto)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Idioma_idIdioma) REFERENCES Idioma(idIdioma)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- 2. DATOS
-- ============================================

-- Desarrolladoras
INSERT INTO Desarrolladora (nombreDesarrolladora) VALUES
('Nintendo'), ('Rockstar Games'), ('CD Projekt Red'), ('Naughty Dog'), ('Ubisoft');

-- Clientes
INSERT INTO Cliente (nombre, email, dateRegistro) VALUES
('Ana García', 'ana@email.com', '2026-01-15'),
('Carlos López', 'carlos@email.com', '2026-02-20'),
('María Sánchez', 'maria@email.com', '2026-03-10');

-- Direcciones
INSERT INTO Direccion (calle, ciudad, codigoPostal, DireccionLocal, idCliente) VALUES
('Calle Mayor 123', 'Madrid', '28001', 'Casa', 1),
('Av. Principal 456', 'Barcelona', '08001', 'Oficina', 2),
('Calle Sol 789', 'Valencia', '46001', 'Casa', 3);

-- Métodos de Pago
INSERT INTO MetodoPago (nombreMetodo) VALUES
('Tarjeta Crédito'), ('PayPal'), ('Transferencia Bancaria');

-- Productos
INSERT INTO Producto (nombreProducto, precioProducto, Tipo, Desarrolladora_idDesarrolladora) VALUES
('The Legend of Zelda: Tears of the Kingdom', 60, 'Físico', 1),
('Red Dead Redemption 2', 30, 'Digital', 2),
('Cyberpunk 2077', 25, 'Digital', 3),
('The Last of Us Part I', 40, 'Físico', 4),
('Assassin\'s Creed Mirage', 50, 'Digital', 5);

-- Plataformas
INSERT INTO Plataforma (nombrePlataforma, fabricante) VALUES
('Nintendo Switch', 'Nintendo'),
('PlayStation 5', 'Sony'),
('Xbox Series X', 'Microsoft'),
('PC', 'N/A');

-- Categorías
INSERT INTO Categoria (categoria) VALUES
('Aventura'), ('RPG'), ('Acción'), ('Mundo Abierto'), ('Stealth');

-- Idiomas
INSERT INTO Idioma (Idioma, codigo) VALUES
('Español', 'ES'), ('Inglés', 'EN'), ('Francés', 'FR'), ('Alemán', 'DE');

-- Relaciones Producto-Platforma
INSERT INTO Producto_has_Plataforma (Producto_idProducto, Plataforma_idPlataforma) VALUES
(1, 1), (2, 2), (2, 3), (3, 4), (4, 2), (5, 2), (5, 3);

-- Relaciones Producto-Categoría
INSERT INTO Producto_has_Categoria (Producto_idProducto, Categoria_idCategoria) VALUES
(1, 1), (1, 3), (2, 3), (2, 4), (3, 2), (3, 4), (4, 1), (4, 3), (5, 3), (5, 5);

-- Relaciones Producto-Idioma
INSERT INTO Producto_has_Idioma (Producto_idProducto, Idioma_idIdioma) VALUES
(1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (3, 2), (4, 1), (5, 1), (5, 2);

-- Pedidos
INSERT INTO Pedido (idCliente, datePedido, totalPrecio, idMetodo, idDireccion) VALUES
(1, '2026-02-01', 90, 1, 1),
(2, '2026-02-15', 30, 2, 2),
(3, '2026-03-01', 65, 3, 3);

-- Detalles de Pedido
INSERT INTO DetallePedido (idPedido, idProducto, cantidad, precioUnidad) VALUES
(1, 1, 1, 60),
(1, 4, 1, 30),
(2, 2, 1, 30),
(3, 3, 1, 25),
(3, 5, 1, 40);