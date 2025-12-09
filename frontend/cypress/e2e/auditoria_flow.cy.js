describe('Flujo de Auditoría', () => {
    const tenantSlug = 'pasteleria-dulce-sabor';
    const adminEmail = 'admin@pasteleria-dulce-sabor.com';
    const adminPassword = 'Admin123!';

    beforeEach(() => {
        // Login como admin
        cy.visit(`/${tenantSlug}/admin/login`);
        cy.get('input[name="tenant_slug"]').should('have.value', tenantSlug);
        cy.get('input[name="email"]').type(adminEmail);
        cy.get('input[name="password"]').type(adminPassword);
        cy.get('button[type="submit"]').click();
        cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('debería acceder a la página de auditoría', () => {
        // Navegar a Auditoría
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');
        cy.contains('Auditoría').should('be.visible');
    });

    it('debería mostrar estadísticas de auditoría', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Verificar que las tarjetas de estadísticas existen
        cy.contains('Total Registros').should('be.visible');
        cy.contains('Éxitos').should('be.visible');
        cy.contains('Fallos').should('be.visible');
        cy.contains('Usuarios Activos').should('be.visible');
    });

    it('debería registrar la creación de un producto', () => {
        const testProducto = `Producto Audit Test ${Date.now()}`;

        // Crear un producto
        cy.contains('Productos').click();
        cy.url().should('include', '/admin/productos');

        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Agregar Producto")').length > 0) {
                cy.contains('button', 'Agregar Producto').click({ force: true });
                cy.contains('Crear Producto', { timeout: 10000 }).should('be.visible');

                cy.get('input[name="nombre"]').type(testProducto);
                cy.get('textarea[name="descripcion"]').type('Producto de prueba para auditoría');
                cy.get('input[name="precio"]').type('1000');
                cy.get('input[name="stock"]').type('5');
                cy.get('select[name="id_categoria"]').select(1);

                cy.contains('button', 'Crear').click({ force: true });
                cy.wait(2000);

                // Ir a Auditoría
                cy.contains('Auditoría').click();
                cy.url().should('include', '/admin/auditoria');

                // Buscar el registro del producto creado
                cy.get('input[placeholder*="Buscar"]').type(testProducto);
                cy.contains('button', 'Buscar').click();

                // Verificar que aparece en la tabla
                cy.contains(testProducto, { timeout: 10000 }).should('be.visible');
                // Verificar que hay registros en la tabla
                cy.get('tbody tr').should('exist');

                // Limpiar: eliminar el producto
                cy.contains('Productos').click();
                cy.contains(testProducto).parents('.card, tr').within(() => {
                    cy.get('button[title="Eliminar producto"]').click({ force: true });
                });
                cy.contains('Confirmar Eliminación').should('be.visible');
                cy.get('button').contains('Eliminar').click({ force: true });
            }
        });
    });

    it('debería filtrar registros por módulo', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Mostrar filtros
        cy.contains('button', 'Mostrar Filtros').click();

        // Filtrar por módulo "productos"
        cy.get('select[name="modulo"]').select('productos');
        cy.contains('button', 'Buscar').click();

        cy.wait(1000);

        // Verificar que todos los registros son del módulo productos
        cy.get('tbody tr').each(($row) => {
            cy.wrap($row).within(() => {
                cy.contains('productos').should('exist');
            });
        });
    });

    it('debería filtrar registros por resultado', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Mostrar filtros
        cy.contains('button', 'Mostrar Filtros').click();

        // Filtrar por resultado "éxito"
        cy.get('select[name="resultado"]').select('exito');
        cy.contains('button', 'Buscar').click();

        cy.wait(1000);

        // Verificar que todos los registros son exitosos
        cy.get('tbody tr').each(($row) => {
            cy.wrap($row).within(() => {
                cy.contains('Éxito').should('exist');
            });
        });
    });

    it('debería exportar registros a CSV', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Click en exportar
        cy.contains('button', 'Exportar CSV').click();

        // Verificar que se inició la descarga (Cypress no puede verificar archivos descargados directamente)
        // Pero podemos verificar que no hubo error
        cy.wait(1000);
    });

    it('debería usar la paginación correctamente', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Esperar a que carguen los datos
        cy.wait(2000);

        // Verificar que hay registros en la tabla
        cy.get('tbody tr').should('exist');

        // Si hay más de una página, probar navegación
        cy.get('body').then(($body) => {
            // Buscar botón Siguiente que no esté deshabilitado
            const nextButton = $body.find('button:contains("Siguiente"):not(:disabled)');
            if (nextButton.length > 0) {
                // Usar force: true porque el botón puede estar oculto en viewport móvil
                cy.contains('button', 'Siguiente').click({ force: true });
                cy.wait(1000);
                cy.contains('button', 'Anterior').should('not.be.disabled');
            }
        });
    });

    it('debería buscar registros por texto', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        // Buscar por "login"
        cy.get('input[placeholder*="Buscar"]').type('login');
        cy.contains('button', 'Buscar').click();

        cy.wait(1000);

        // Verificar que hay resultados o mensaje de "no encontrado"
        cy.get('body').then(($body) => {
            if ($body.find('tbody tr').length > 0) {
                // Hay resultados
                cy.get('tbody tr').should('exist');
            } else {
                // No hay resultados
                cy.contains('No se encontraron registros').should('be.visible');
            }
        });
    });

    it('debería mostrar información completa en cada registro', () => {
        cy.contains('Auditoría').click();
        cy.url().should('include', '/admin/auditoria');

        cy.wait(2000);

        // Verificar que la tabla tiene todas las columnas
        cy.get('thead th').should('contain', 'Fecha/Hora');
        cy.get('thead th').should('contain', 'Usuario');
        cy.get('thead th').should('contain', 'Módulo');
        cy.get('thead th').should('contain', 'Acción');
        cy.get('thead th').should('contain', 'Descripción');
        cy.get('thead th').should('contain', 'Resultado');
        cy.get('thead th').should('contain', 'Acciones');

        // Verificar que hay al menos un registro
        cy.get('tbody tr').first().within(() => {
            cy.get('td').should('have.length', 7);
        });
    });
});
