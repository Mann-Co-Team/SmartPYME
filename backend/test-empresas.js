/**
 * Script para crear 3 empresas de prueba con diferentes planes
 * Ejecutar: node test-empresas.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const empresasPrueba = [
  {
    nombre_empresa: 'TechStore Básico',
    email_empresa: 'contacto@techstore-basico.com',
    telefono_empresa: '+58 412 1111111',
    direccion_empresa: 'Av. Principal, Caracas',
    plan: 'basico',
    admin: {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos@techstore-basico.com',
      password: 'admin123',
      telefono: '+58 424 1111111'
    }
  },
  {
    nombre_empresa: 'Fashion Store Pro',
    email_empresa: 'info@fashionstore-pro.com',
    telefono_empresa: '+58 412 2222222',
    direccion_empresa: 'Centro Comercial Miranda, Valencia',
    plan: 'profesional',
    admin: {
      nombre: 'Laura',
      apellido: 'Martínez',
      email: 'laura@fashionstore-pro.com',
      password: 'admin123',
      telefono: '+58 424 2222222'
    }
  },
  {
    nombre_empresa: 'MegaMarket Empresarial',
    email_empresa: 'ventas@megamarket-corp.com',
    telefono_empresa: '+58 412 3333333',
    direccion_empresa: 'Zona Industrial, Maracay',
    plan: 'empresarial',
    admin: {
      nombre: 'Roberto',
      apellido: 'Fernández',
      email: 'roberto@megamarket-corp.com',
      password: 'admin123',
      telefono: '+58 424 3333333'
    }
  }
];

async function crearEmpresa(datos) {
  try {
    console.log(`\n📝 Creando empresa: ${datos.nombre_empresa} (Plan: ${datos.plan.toUpperCase()})`);
    
    const response = await axios.post(`${API_URL}/tenants/register`, datos);
    
    if (response.data.success) {
      const tenant = response.data.data;
      console.log(`✅ Empresa creada exitosamente!`);
      console.log(`   🏢 Nombre: ${tenant.nombre_empresa}`);
      console.log(`   🔗 Slug: ${tenant.slug}`);
      console.log(`   📦 Plan: ${tenant.plan}`);
      console.log(`   🌐 URL: http://localhost:5173/tienda/${tenant.slug}`);
      console.log(`   👤 Admin: ${datos.admin.email}`);
      console.log(`   🔑 Password: ${datos.admin.password}`);
      return { success: true, tenant };
    }
  } catch (error) {
    console.error(`❌ Error al crear ${datos.nombre_empresa}:`);
    if (error.response) {
      console.error(`   Mensaje: ${error.response.data.message || 'Error desconocido'}`);
      console.error(`   Status: ${error.response.status}`);
      if (error.response.data.error) {
        console.error(`   Detalle: ${error.response.data.error}`);
      }
    } else {
      console.error(`   ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function verificarLogin(email, password, tenantSlug) {
  try {
    console.log(`\n🔐 Verificando login para ${email}...`);
    
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email,
      password,
      tenant_slug: tenantSlug
    });
    
    // El token está en response.data.data.token según la estructura del controlador
    const token = response.data.data?.token || response.data.token;
    
    if (token) {
      console.log(`✅ Login exitoso!`);
      console.log(`   Token generado correctamente`);
      console.log(`   Usuario: ${response.data.data?.user?.nombre || 'N/A'}`);
      return { success: true, token };
    }
    
    return { success: false, error: 'No se recibió token' };
  } catch (error) {
    console.error(`❌ Error en login:`);
    if (error.response) {
      console.error(`   ${error.response.data.message || 'Error desconocido'}`);
    } else {
      console.error(`   ${error.message}`);
    }
    return { success: false };
  }
}

async function verificarTienda(slug) {
  try {
    console.log(`\n🏪 Verificando tienda pública: ${slug}...`);
    
    const response = await axios.get(`${API_URL}/tenants/slug/${slug}`);
    
    if (response.data.data) {
      console.log(`✅ Tienda accesible públicamente!`);
      console.log(`   Nombre: ${response.data.data.nombre_empresa}`);
      console.log(`   Estado: ${response.data.data.activo ? 'Activo' : 'Inactivo'}`);
      return { success: true };
    }
  } catch (error) {
    console.error(`❌ Error al verificar tienda:`);
    if (error.response) {
      console.error(`   ${error.response.data.message || 'Error desconocido'}`);
    } else {
      console.error(`   ${error.message}`);
    }
    return { success: false };
  }
}

async function ejecutarPruebas() {
  console.log('🚀 Iniciando testing de registro de empresas con diferentes planes...');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const resultados = [];
  
  for (const empresa of empresasPrueba) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`TEST: ${empresa.nombre_empresa} - Plan ${empresa.plan.toUpperCase()}`);
    console.log('═'.repeat(60));
    
    // 1. Crear empresa
    const resultadoCreacion = await crearEmpresa(empresa);
    
    if (resultadoCreacion.success) {
      const { tenant } = resultadoCreacion;
      
      // Esperar un momento para que se cree todo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Verificar login del admin
      const resultadoLogin = await verificarLogin(
        empresa.admin.email,
        empresa.admin.password,
        tenant.slug
      );
      
      // 3. Verificar que la tienda sea accesible públicamente
      const resultadoTienda = await verificarTienda(tenant.slug);
      
      resultados.push({
        empresa: empresa.nombre_empresa,
        plan: empresa.plan,
        creacion: resultadoCreacion.success,
        login: resultadoLogin.success,
        tiendaPublica: resultadoTienda.success,
        slug: tenant.slug,
        email: empresa.admin.email
      });
    } else {
      resultados.push({
        empresa: empresa.nombre_empresa,
        plan: empresa.plan,
        creacion: false,
        login: false,
        tiendaPublica: false
      });
    }
    
    // Esperar entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Resumen final
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═'.repeat(60));
  
  resultados.forEach((resultado, index) => {
    console.log(`\n${index + 1}. ${resultado.empresa} (${resultado.plan.toUpperCase()})`);
    console.log(`   Creación:        ${resultado.creacion ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Login Admin:     ${resultado.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Tienda Pública:  ${resultado.tiendaPublica ? '✅ PASS' : '❌ FAIL'}`);
    if (resultado.slug) {
      console.log(`   URL: http://localhost:5173/tienda/${resultado.slug}`);
      console.log(`   Admin: ${resultado.email} / admin123`);
    }
  });
  
  const totalPruebas = resultados.length * 3;
  const pruebasExitosas = resultados.reduce((acc, r) => 
    acc + (r.creacion ? 1 : 0) + (r.login ? 1 : 0) + (r.tiendaPublica ? 1 : 0), 0
  );
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Pruebas exitosas: ${pruebasExitosas}/${totalPruebas}`);
  console.log(`❌ Pruebas fallidas: ${totalPruebas - pruebasExitosas}/${totalPruebas}`);
  console.log(`📊 Porcentaje de éxito: ${((pruebasExitosas/totalPruebas)*100).toFixed(1)}%`);
  console.log('═'.repeat(60));
  
  console.log('\n\n🎯 ACCESO RÁPIDO A LAS TIENDAS:');
  console.log('═'.repeat(60));
  resultados.forEach((resultado, index) => {
    if (resultado.slug) {
      console.log(`\n${index + 1}. ${resultado.empresa}:`);
      console.log(`   Admin Panel: http://localhost:5173/admin/login`);
      console.log(`   Tenant Slug: ${resultado.slug}`);
      console.log(`   Email: ${resultado.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Tienda Pública: http://localhost:5173/tienda/${resultado.slug}`);
    }
  });
  
  console.log('\n\n✨ Testing completado!\n');
}

// Ejecutar pruebas
ejecutarPruebas().catch(error => {
  console.error('💥 Error fatal en el testing:', error);
  process.exit(1);
});
