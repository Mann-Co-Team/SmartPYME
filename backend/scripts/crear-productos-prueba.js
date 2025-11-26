// Script para crear productos de prueba
const mysql = require('mysql2/promise');
require('dotenv').config();

const productos = {
    // Pastelería Dulce Sabor (tenant_id: 18)
    18: {
        'Tortas': [
            { nombre: 'Torta de Chocolate', descripcion: 'Deliciosa torta de chocolate belga', precio: 25000, stock: 10 },
            { nombre: 'Torta de Zanahoria', descripcion: 'Torta casera de zanahoria con nueces', precio: 22000, stock: 8 },
            { nombre: 'Torta Red Velvet', descripcion: 'Clásica torta roja con glaseado de queso crema', precio: 28000, stock: 5 }
        ],
        'Pasteles': [
            { nombre: 'Pie de Limón', descripcion: 'Pie de limón con merengue italiano', precio: 15000, stock: 12 },
            { nombre: 'Cheesecake de Frutilla', descripcion: 'Cheesecake estilo New York con salsa de frutilla', precio: 18000, stock: 10 },
            { nombre: 'Kuchen de Manzana', descripcion: 'Kuchen tradicional de manzana y canela', precio: 12000, stock: 15 }
        ],
        'Bebidas': [
            { nombre: 'Café Grano', descripcion: 'Café de grano recién molido', precio: 2500, stock: 100 },
            { nombre: 'Té Premium', descripcion: 'Selección de tés premium', precio: 2000, stock: 100 }
        ]
    },
    // Boutique Fashion Elite (tenant_id: 19)
    19: {
        'Ropa de Mujer': [
            { nombre: 'Vestido Elegante Negro', descripcion: 'Vestido largo de noche, perfecto para eventos especiales', precio: 89990, stock: 15 },
            { nombre: 'Blusa de Seda Blanca', descripcion: 'Blusa elegante de seda 100%, ideal para oficina', precio: 45990, stock: 25 }
        ],
        'Accesorios': [
            { nombre: 'Bolso de Cuero Premium', descripcion: 'Bolso de mano en cuero genuino, varios colores', precio: 129990, stock: 10 }
        ]
    }
};

async function crearProductos() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Conexión exitosa');

        for (const [tenantId, categorias] of Object.entries(productos)) {
            console.log(`\n🏢 Procesando Tenant ID: ${tenantId}`);

            for (const [categoriaNombre, productosArray] of Object.entries(categorias)) {
                // 1. Verificar si la categoría existe
                const [rows] = await connection.execute(
                    'SELECT id_categoria FROM categorias WHERE nombre = ? AND id_tenant = ?',
                    [categoriaNombre, tenantId]
                );

                let categoriaId;

                if (rows.length === 0) {
                    console.log(`  ⚠️  Categoría "${categoriaNombre}" no encontrada. Creándola...`);
                    const [result] = await connection.execute(
                        'INSERT INTO categorias (nombre, descripcion, id_tenant, activo) VALUES (?, ?, ?, 1)',
                        [categoriaNombre, `Categoría ${categoriaNombre}`, tenantId]
                    );
                    categoriaId = result.insertId;
                    console.log(`  ✅ Categoría creada con ID: ${categoriaId}`);
                } else {
                    categoriaId = rows[0].id_categoria;
                    console.log(`  ✅ Categoría "${categoriaNombre}" encontrada (ID: ${categoriaId})`);
                }

                // 2. Insertar productos
                for (const producto of productosArray) {
                    // Verificar si el producto ya existe para evitar duplicados
                    const [existing] = await connection.execute(
                        'SELECT id_producto FROM productos WHERE nombre = ? AND id_tenant = ?',
                        [producto.nombre, tenantId]
                    );

                    if (existing.length > 0) {
                        // Actualizar stock si ya existe
                        await connection.execute(
                            'UPDATE productos SET stock = ? WHERE id_producto = ?',
                            [producto.stock, existing[0].id_producto]
                        );
                        console.log(`     ↻ ${producto.nombre} - Stock actualizado a ${producto.stock}`);
                    } else {
                        await connection.execute(
                            'INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_tenant, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                            [producto.nombre, producto.descripcion, producto.precio, producto.stock, categoriaId, tenantId]
                        );
                        console.log(`     + ${producto.nombre} - $${producto.precio.toLocaleString()}`);
                    }
                }
            }
        }

        console.log('\n✅ ¡Proceso finalizado!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

crearProductos();
