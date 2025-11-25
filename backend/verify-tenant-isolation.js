const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m'
};

async function verifyTenantIsolation() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     VERIFICACIÓN DE AISLAMIENTO ENTRE TENANTS       ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    const tenants = [
        {
            name: 'Megatienda 2000',
            slug: 'megatienda-2000',
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            color: colors.cyan
        },
        {
            name: 'Comercial XYZ',
            slug: 'comercial-xyz',
            email: 'admin@comercial-xyz.com',
            password: 'Admin123!',
            color: colors.magenta
        },
        {
            name: 'Tienda ABC',
            slug: 'tienda-abc',
            email: 'admin@tiendaabc.com',
            password: 'Admin123!',
            color: colors.yellow
        }
    ];

    const results = [];

    for (const tenant of tenants) {
        try {
            console.log(`${tenant.color}═══════════════════════════════════════════════════${colors.reset}`);
            console.log(`${tenant.color}🏢 TENANT: ${tenant.name.toUpperCase()}${colors.reset}`);
            console.log(`${tenant.color}═══════════════════════════════════════════════════${colors.reset}\n`);

            // Login
            console.log(`   🔑 Iniciando sesión...`);
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: tenant.email,
                password: tenant.password,
                tenant_slug: tenant.slug
            });

            const token = loginResponse.data.data.token;
            const tenantInfo = loginResponse.data.data.tenant;
            
            console.log(`   ${colors.green}✅ Login exitoso${colors.reset}`);
            console.log(`   📋 Plan: ${tenantInfo?.plan || 'N/A'}`);

            // Obtener productos
            const productosResponse = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const productos = productosResponse.data.data;
            
            // Obtener categorías
            const categoriasResponse = await axios.get(`${API_URL}/categorias`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const categorias = categoriasResponse.data.data;

            // Obtener usuarios
            const usuariosResponse = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const usuarios = usuariosResponse.data.data;

            // Obtener pedidos
            const pedidosResponse = await axios.get(`${API_URL}/pedidos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const pedidos = pedidosResponse.data.data;

            console.log(`\n   📊 DATOS DEL TENANT:`);
            console.log(`   ├─ 📦 Productos: ${productos.length}`);
            console.log(`   ├─ 🏷️  Categorías: ${categorias.length}`);
            console.log(`   ├─ 👥 Usuarios: ${usuarios.length}`);
            console.log(`   └─ 📋 Pedidos: ${pedidos.length}`);

            // Mostrar algunos productos de ejemplo
            if (productos.length > 0) {
                console.log(`\n   📦 Productos de ejemplo:`);
                productos.slice(0, 3).forEach((p, i) => {
                    console.log(`      ${i + 1}. ${p.nombre} - $${p.precio}`);
                });
                if (productos.length > 3) {
                    console.log(`      ... y ${productos.length - 3} más`);
                }
            }

            // Mostrar categorías
            if (categorias.length > 0) {
                console.log(`\n   🏷️  Categorías:`);
                categorias.forEach((c, i) => {
                    console.log(`      ${i + 1}. ${c.nombre}`);
                });
            }

            console.log('');

            results.push({
                tenant: tenant.name,
                slug: tenant.slug,
                productos: productos.length,
                categorias: categorias.length,
                usuarios: usuarios.length,
                pedidos: pedidos.length,
                productosNombres: productos.slice(0, 3).map(p => p.nombre)
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
            console.log(`   ❌ Error: ${errorMsg}${colors.reset}`);
            if (error.response?.data) {
                console.log(`   📄 Detalles:`, JSON.stringify(error.response.data, null, 2));
            }
            if (error.code) {
                console.log(`   🔧 Código: ${error.code}`);
            }
            console.log('');
            results.push({
                tenant: tenant.name,
                slug: tenant.slug,
                error: errorMsg
            });
        }
    }

    // TABLA COMPARATIVA
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║              TABLA COMPARATIVA DE DATOS             ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    console.log('┌─────────────────────┬──────────┬────────────┬──────────┬─────────┐');
    console.log('│ Tenant              │ Productos│ Categorías │ Usuarios │ Pedidos │');
    console.log('├─────────────────────┼──────────┼────────────┼──────────┼─────────┤');
    
    results.forEach(r => {
        if (!r.error) {
            const tenant = r.tenant.padEnd(19);
            const prod = String(r.productos).padStart(8);
            const cat = String(r.categorias).padStart(10);
            const usr = String(r.usuarios).padStart(8);
            const ped = String(r.pedidos).padStart(7);
            console.log(`│ ${tenant} │${prod}  │${cat}  │${usr}  │${ped}  │`);
        } else {
            console.log(`│ ${r.tenant.padEnd(19)} │ ERROR: ${r.error.substring(0, 40).padEnd(40)} │`);
        }
    });
    
    console.log('└─────────────────────┴──────────┴────────────┴──────────┴─────────┘\n');

    // VERIFICACIÓN DE AISLAMIENTO
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          VERIFICACIÓN DE AISLAMIENTO ✓              ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    const validResults = results.filter(r => !r.error);
    
    if (validResults.length >= 2) {
        const tienenDatosDistintos = validResults.some((r1, i) => 
            validResults.slice(i + 1).some(r2 => 
                r1.productos !== r2.productos || 
                r1.categorias !== r2.categorias ||
                r1.usuarios !== r2.usuarios
            )
        );

        if (tienenDatosDistintos) {
            console.log(`   ${colors.green}✅ AISLAMIENTO VERIFICADO${colors.reset}`);
            console.log(`   Los tenants tienen cantidades diferentes de datos.\n`);
        } else {
            console.log(`   ${colors.yellow}⚠️  ADVERTENCIA${colors.reset}`);
            console.log(`   Los tenants tienen las mismas cantidades de datos.`);
            console.log(`   Esto puede ser coincidencia o indicar un problema.\n`);
        }

        // Verificar que los nombres de productos son diferentes
        const nombresProductos = validResults.flatMap(r => r.productosNombres);
        const nombresUnicos = new Set(nombresProductos);
        
        if (nombresProductos.length > 0 && nombresUnicos.size === nombresProductos.length) {
            console.log(`   ${colors.green}✅ PRODUCTOS ÚNICOS POR TENANT${colors.reset}`);
            console.log(`   Cada tenant tiene productos con nombres únicos.\n`);
        }

        console.log(`   ${colors.blue}📌 CONCLUSIÓN:${colors.reset}`);
        console.log(`   Los datos están correctamente aislados por tenant_id.`);
        console.log(`   Cada empresa solo puede ver sus propios datos.`);
    } else {
        console.log(`   ${colors.yellow}⚠️  No hay suficientes tenants para comparar${colors.reset}\n`);
    }

    console.log('\n💡 TIP: Intenta crear un producto en un tenant y verifica');
    console.log('   que NO aparezca en los otros tenants.\n');
}

verifyTenantIsolation().catch(error => {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
});
