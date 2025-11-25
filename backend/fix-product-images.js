const db = require('./config/db');

async function fixImages() {
    try {
        console.log('\n=== CORRIGIENDO IMÁGENES ===\n');

        // 1. Corregir imagen de GoPro Hero 12 Black (imagen de tomate incorrecta)
        console.log('1. Corrigiendo imagen de GoPro Hero 12 Black...');
        await db.execute(
            `UPDATE productos 
             SET imagen = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500'
             WHERE nombre LIKE '%GoPro Hero 12%' AND id_tenant = (
                SELECT id_tenant FROM tenants WHERE slug = 'electrotech-premium'
             )`,
            []
        );
        console.log('   ✅ GoPro corregida');

        // 2. Agregar imagen de Blusa de Seda a Boutique
        console.log('\n2. Agregando imagen a Blusa de Seda...');
        await db.execute(
            `UPDATE productos 
             SET imagen = 'https://images.unsplash.com/photo-1624206112431-4a48a6e3e2f5?w=500'
             WHERE nombre LIKE '%Blusa de Seda%' AND id_tenant = (
                SELECT id_tenant FROM tenants WHERE slug = 'boutique-fashion-elite'
             )`,
            []
        );
        console.log('   ✅ Blusa actualizada');

        // 3. Verificar productos sin imagen
        console.log('\n3. Buscando productos sin imagen...');
        const [noImage] = await db.execute(
            `SELECT p.nombre, t.nombre_empresa, t.slug 
             FROM productos p
             JOIN tenants t ON p.id_tenant = t.id_tenant
             WHERE (p.imagen IS NULL OR p.imagen = '')
             AND t.slug IN ('electrotech-premium', 'boutique-fashion-elite', 'pasteleria-dulce-sabor')`,
            []
        );
        
        if (noImage.length > 0) {
            console.log(`   ⚠️  Productos sin imagen: ${noImage.length}`);
            noImage.forEach(p => {
                console.log(`      - ${p.nombre} (${p.nombre_empresa})`);
            });
        } else {
            console.log('   ✅ Todos los productos tienen imagen');
        }

        console.log('\n✅ CORRECCIÓN COMPLETADA\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.end();
    }
}

fixImages();
