describe('Purchase Flow', () => {
    const tenantSlug = 'pasteleria-dulce-sabor';

    it('should complete a purchase flow', () => {
        const testEmail = `cypress_${Date.now()}@test.com`;

        // 1. Navigation from Landing Page
        cy.visit('/');

        // Click "Ir de Compras"
        cy.contains('Ir de Compras').click();
        cy.url().should('include', '/tiendas');

        // Select "Pastelería Dulce Sabor"
        // We look for the card containing the text and click the button inside it or the card itself
        cy.contains('h3', 'Pastelería Dulce Sabor').parents('div').first().click();

        // Verify we are on the store home page
        cy.url().should('include', `/tienda/${tenantSlug}`);

        // Navigate to Login/Register
        cy.contains('Registro / Iniciar Sesión').click();
        cy.url().should('include', `/tienda/${tenantSlug}/login`);

        // Navigate to Register
        cy.contains('Regístrate aquí').click();
        cy.url().should('include', `/tienda/${tenantSlug}/registro`);

        // 2. Register Form
        cy.get('input[name="nombre"]').type('Cypress');
        cy.get('input[name="apellido"]').type('User');
        cy.get('input[name="email"]').type(testEmail);
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Verify success message
        cy.contains('¡Registro exitoso!').should('be.visible');

        // Wait for redirection to login
        cy.url({ timeout: 10000 }).should('include', `/tienda/${tenantSlug}/login`);

        // 2. Login
        cy.contains('Iniciar Sesión').should('be.visible');
        // Use ID selectors as they are more reliable and present in TiendaLogin.jsx
        cy.get('#email').type(testEmail);
        cy.get('#password').type('password123');
        cy.get('button[type="submit"]').click();

        // Verify login success - Redirects to home
        cy.url().should('include', `/tienda/${tenantSlug}`);
        // Check for user menu or similar to confirm login
        cy.contains('Cypress').should('exist');

        // 3. Add product to cart
        // Ensure we are on home and products are loaded
        cy.get('.grid').should('exist');

        // Click "Añadir al carrito" on the first product
        cy.contains('button', 'Añadir al carrito').first().click();

        // 4. Go to cart
        // Wait for badge to appear indicating item added
        cy.get('nav button span', { timeout: 5000 }).should('exist');
        // Click the cart button (parent of the badge)
        cy.get('nav button:has(span.bg-amber-600)').click();

        // 5. Checkout
        // In sidebar, click "Proceder al pago"
        cy.contains('Proceder al pago').click();

        // Checkout page
        cy.url().should('include', '/checkout');
        // Select delivery method (it's a button, not a select)
        cy.contains('Retiro en tienda').click();

        cy.get('select[name="metodo_pago"]').select('efectivo');
        cy.get('button').contains('Confirmar Pedido').click();

        // 6. Verify success
        cy.contains('¡Pedido creado exitosamente!', { timeout: 10000 }).should('be.visible');
        cy.url().should('include', '/pedidos');
    });
});
