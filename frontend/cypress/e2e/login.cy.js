describe('Login Flow', () => {
    it('should login successfully with valid credentials', () => {
        cy.intercept('POST', '**/api/v1/login', {
            statusCode: 200,
            body: {
                token: 'mock_token',
                user: { email: 'test@example.com', role: 'patient' }
            }
        }).as('loginRequest');

        cy.visit('/login');
        cy.get('input[type="email"]').type('test@example.com');
        cy.get('input[type="password"]').type('password');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.url().should('include', '/');
        cy.contains('Welcome back');
    });

    it('should show error on invalid credentials', () => {
        cy.intercept('POST', '**/api/v1/login', {
            statusCode: 401,
            body: { error: 'Invalid email or password' }
        }).as('loginFail');

        cy.visit('/login');
        cy.get('input[type="email"]').type('wrong@example.com');
        cy.get('input[type="password"]').type('wrong');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginFail');
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Login failed');
        });
    });
});
