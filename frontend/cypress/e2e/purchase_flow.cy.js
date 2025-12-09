describe('Flujo de Compra', () => {
    const tenantSlug = 'pasteleria-dulce-sabor';

    it('debería completar un flujo de compra', () => {
        const testEmail = `cypress_${Date.now()}@test.com`;

        // 1. Navegación desde la Página de Inicio
        cy.visit('/');

        // Hacer clic en "Ir de Compras"
        cy.contains('Ir de Compras').click();
        cy.url().should('include', '/tiendas');

        // Seleccionar "Pastelería Dulce Sabor"
        // Buscamos la tarjeta que contiene el texto y hacemos clic en el botón dentro de ella o en la tarjeta misma
        cy.contains('h3', 'Pastelería Dulce Sabor').parents('div').first().click();

        // Verificar que estamos en la página de inicio de la tienda
        cy.url().should('include', `/tienda/${tenantSlug}`);

        // Navegar a Login/Registro
        cy.contains('Registro / Iniciar Sesión').click();
        cy.url().should('include', `/tienda/${tenantSlug}/login`);

        // Navegar a Registro
        cy.contains('Regístrate aquí').click();
        cy.url().should('include', `/tienda/${tenantSlug}/registro`);

        // 2. Formulario de Registro
        cy.get('input[name="nombre"]').type('Cypress');
        cy.get('input[name="apellido"]').type('User');
        cy.get('input[name="email"]').type(testEmail);
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Verificar mensaje de éxito
        cy.contains('Registro exitoso').should('be.visible');

        // Esperar redirección a login
        cy.url({ timeout: 10000 }).should('include', `/tienda/${tenantSlug}/login`);

        // 3. Iniciar Sesión
        cy.contains('Iniciar Sesión').should('be.visible');
        // Usar selectores de ID ya que son más confiables y están presentes en TiendaLogin.jsx
        cy.get('#email').type(testEmail);
        cy.get('#password').type('password123');
        cy.get('button[type="submit"]').click();

        // Verificar inicio de sesión exitoso - Redirige a inicio
        cy.url().should('include', `/tienda/${tenantSlug}`);
        // Verificar menú de usuario o similar para confirmar login
        cy.contains('Cypress').should('exist');

        // 4. Agregar producto al carrito
        // Asegurar que estamos en inicio y los productos están cargados
        cy.get('.grid').should('exist');

        // Hacer clic en "Agregar" en el primer producto (plan básico)
        cy.contains('button', 'Agregar').first().click();

        // 5. Ir al carrito
        // Esperar a que aparezca la insignia indicando que se agregó el artículo
        cy.get('nav button span', { timeout: 5000 }).should('exist');
        // Hacer clic en el botón del carrito (padre de la insignia)
        cy.get('nav button:has(span.bg-amber-600)').click();

        // 6. Checkout
        // En la barra lateral, hacer clic en "Proceder al Pago"
        cy.contains('Proceder al Pago').click({ force: true });

        // Página de checkout
        cy.url().should('include', '/checkout');
        // Seleccionar método de entrega (es un botón, no un select)
        cy.contains('Retiro en tienda').click();

        cy.get('select[name="metodo_pago"]').select('efectivo');
        cy.get('button').contains('Confirmar Pedido').click();

        // 7. Verificar éxito
        cy.contains('¡Pedido creado exitosamente!', { timeout: 10000 }).should('be.visible');
        cy.url().should('include', '/pedidos');
    });
});
