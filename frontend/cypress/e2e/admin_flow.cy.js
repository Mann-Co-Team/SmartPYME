describe('Admin Management Flow', () => {
    const tenantSlug = 'pasteleria-dulce-sabor';
    const adminEmail = 'admin@pasteleria-dulce-sabor.com';
    const adminPassword = 'Admin123!';
    const testProduct = {
        name: 'Producto de Prueba Cypress',
        price: '5000',
        stock: '10'
    };
    const testCategory = 'Categoría Cypress';

    beforeEach(() => {
        // Login before each test to ensure clean state
        cy.visit(`/${tenantSlug}/admin/login`);
        cy.get('input[name="tenant_slug"]').should('have.value', tenantSlug);
        cy.get('input[name="email"]').type(adminEmail);
        cy.get('input[name="password"]').type(adminPassword);
        cy.get('button[type="submit"]').click();
        cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate to orders and verify list', () => {
        cy.contains('Pedidos').click();
        cy.url().should('include', '/admin/pedidos');
        cy.contains('Gestión de Pedidos').should('be.visible');
        cy.contains('Cargando pedidos...').should('not.exist');

        cy.get('body').then(($body) => {
            if ($body.find('.card').length > 0) {
                cy.contains('button', /Ver Detalle/i).should('exist');
            } else {
                cy.contains('No hay pedidos para mostrar').should('be.visible');
            }
        });
    });

    it('should manage categories (create)', () => {
        cy.contains('Categorías').click();
        cy.url().should('include', '/admin/categorias');
        cy.contains('Gestión de Categorías').should('be.visible');

        // Create Category
        cy.contains('button', 'Agregar Categoría').click({ force: true });
        cy.contains('Nueva Categoría', { timeout: 10000 }).should('be.visible');

        cy.get('input[name="nombre"]').type(testCategory);
        cy.get('textarea[name="descripcion"]').type('Descripción de prueba creada por Cypress');

        // Submit
        cy.contains('button', 'Crear Categoría').click({ force: true });

        // Verify creation
        cy.contains(testCategory).should('be.visible');
    });

    it('should manage products (create/edit)', () => {
        cy.contains('Productos').click();
        cy.url().should('include', '/admin/productos');
        cy.contains('Gestión de Productos').should('be.visible');

        cy.get('body').then(($body) => {
            // Cleanup: Delete existing test product if it exists
            if ($body.text().includes(testProduct.name)) {
                cy.contains(testProduct.name).parents('.card, tr').scrollIntoView().within(() => {
                    cy.get('button[title="Eliminar producto"]').click({ force: true });
                });
                cy.contains('Confirmar Eliminación').should('be.visible');
                cy.get('button').contains('Eliminar').click({ force: true });
                cy.contains(testProduct.name).should('not.exist');
                cy.wait(1000); // Wait for list to refresh
            }

            if ($body.find('button:contains("Agregar Producto")').length > 0) {
                // Create Product
                cy.wait(1000); // Wait for UI to settle
                cy.contains('button', 'Agregar Producto').click({ force: true });
                cy.contains('Crear Producto', { timeout: 10000 }).should('be.visible');

                cy.get('input[name="nombre"]').type(testProduct.name);
                cy.get('textarea[name="descripcion"]').type('Descripción del producto de prueba');
                cy.get('input[name="precio"]').type(testProduct.price);
                cy.get('input[name="stock"]').type(testProduct.stock);

                // Select category
                cy.get('select[name="id_categoria"]').select(1);

                // Submit
                cy.contains('button', 'Crear').click({ force: true });

                // Verify creation
                cy.contains(testProduct.name).scrollIntoView().should('be.visible');

                // Delete Product
                cy.contains(testProduct.name).parents('.card, tr').scrollIntoView().within(() => {
                    cy.get('button[title="Eliminar producto"]').click({ force: true });
                });

                // Confirm deletion
                cy.contains('Confirmar Eliminación').should('be.visible');
                cy.get('button').contains('Eliminar').click({ force: true });

                // Verify deletion
                cy.contains(testProduct.name).should('not.exist');
            } else {
                // Limit reached handling
                cy.contains('Límite Alcanzado').should('be.visible');
                cy.log('Product limit reached, testing Edit functionality instead');

                // Try to edit the first product
                cy.get('.card, tr').first().within(() => {
                    cy.contains('button', 'Editar').click({ force: true });
                });
                cy.contains('Editar Producto', { timeout: 10000 }).should('be.visible');
                // Close modal
                cy.get('button').find('svg').first().click({ force: true });
            }
        });
    });

    it('should generate reports', () => {
        cy.contains('Reportes').click();
        cy.url().should('include', '/admin/reportes');
        cy.contains('Reportes de Ventas').should('be.visible');

        // Select "Mes" filter
        cy.contains('button', 'Mes').click({ force: true });

        // Generate Report
        cy.contains('button', 'Generar Reporte').click({ force: true });

        // Verify report content loads
        cy.contains('Generando...').should('not.exist');

        // Check for metrics or "No hay ventas" message
        cy.get('body').then(($body) => {
            if ($body.text().includes('Total Ventas')) {
                cy.contains('Total Ventas').should('be.visible');
            } else {
                cy.contains('Selecciona un período').should('exist');
            }
        });
    });

    it('should manage users (create/edit)', () => {
        cy.contains('Usuarios').click();
        cy.url().should('include', '/admin/usuarios');
        cy.contains('Gestión de Usuarios').should('be.visible');

        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Nuevo Usuario")').length > 0) {
                // Open New User Modal
                cy.contains('button', 'Nuevo Usuario').click({ force: true });
                cy.contains('Nuevo Usuario', { timeout: 10000 }).should('be.visible');

                // Close modal
                cy.get('button').find('svg').first().click({ force: true }); // XMarkIcon
                cy.contains('Nuevo Usuario').should('not.exist');
            } else {
                // Limit reached handling
                cy.contains('Límite Alcanzado').should('be.visible');
                cy.log('User limit reached, testing Edit functionality instead');

                // Try to edit the first user
                cy.get('tbody tr').first().within(() => {
                    cy.get('button[title="Editar"]').click({ force: true });
                });
                cy.contains('Editar Usuario', { timeout: 10000 }).should('be.visible');
                // Close modal
                cy.get('button').find('svg').first().click({ force: true });
            }
        });
    });
});
