describe('Full System Demo Flow', () => {
    let timeline = [];
    let startTime = Date.now();

    beforeEach(() => {
        // Set fixed viewport for consistency
        cy.viewport(1280, 720);

        cy.intercept('POST', '**/api/v1/register', {
            statusCode: 201,
            body: {
                token: 'mock_token',
                user: { email: 'demo@example.com', role: 'patient' }
            }
        }).as('register');

        cy.intercept('POST', '**/api/v1/login', {
            statusCode: 200,
            body: {
                token: 'mock_token',
                user: { email: 'demo@example.com', role: 'patient' }
            }
        }).as('login');

        // Inject styles and helper function
        cy.on('window:before:load', (win) => {
            const doc = win.document;

            // Create style element
            const style = doc.createElement('style');
            style.innerHTML = `
                .cypress-click-cursor {
                    position: fixed;
                    z-index: 2147483647; /* Max z-index */
                    pointer-events: none;
                    width: 24px;
                    height: 24px;
                    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgM2w3LjA3IDE2Ljk3IDIuNTEtNy4zOUwxOS45NyAxMyAzIDN6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==');
                    transition: transform 0.05s;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }
                .cypress-click-ripple {
                    position: fixed;
                    z-index: 2147483646;
                    pointer-events: none;
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 0, 0, 0.8);
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    animation: ripple-anim 0.4s ease-out forwards;
                }
                @keyframes ripple-anim {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }
                @keyframes cursor-click {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.8); }
                    100% { transform: scale(1); }
                }
            `;
            doc.head.appendChild(style);

            // Global function to trigger visual effect
            win.showCypressClick = (x, y) => {
                const cursor = doc.createElement('div');
                cursor.className = 'cypress-click-cursor';
                cursor.style.left = x + 'px';
                cursor.style.top = y + 'px';
                doc.body.appendChild(cursor);

                cursor.style.animation = 'cursor-click 0.2s ease-in-out';

                const ripple = doc.createElement('div');
                ripple.className = 'cypress-click-ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                doc.body.appendChild(ripple);

                setTimeout(() => {
                    cursor.remove();
                    ripple.remove();
                }, 500);
            };
        });
    });

    // Custom command for visual clicking
    Cypress.Commands.add('visualClick', { prevSubject: 'element' }, (subject) => {
        cy.wrap(subject).then(($el) => {
            const rect = $el[0].getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Trigger visual effect via window
            cy.window().then((win) => {
                win.showCypressClick(x, y);
            });

            // Wait for visual to register
            cy.wait(300);

            // Perform actual click
            cy.wrap($el).click();
        });
    });

    after(() => {
        // Write the timeline to a file
        const data = {
            steps: timeline
        };
        cy.writeFile('cypress/logs/timeline.json', JSON.stringify(data, null, 2));
    });

    const logStep = (text) => {
        cy.then(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            timeline.push({ start: elapsed, text });
        });
    };

    it('should visit all pages and log actions', () => {
        logStep("We start by logging into the system with our secure credentials.");
        cy.visit('/login');
        cy.wait(1000);

        // Click and type email
        cy.get('input[type="email"]').visualClick();
        cy.wait(500);
        cy.get('input[type="email"]').type('demo@example.com');

        // Click and type password
        cy.get('input[type="password"]').visualClick();
        cy.wait(500);
        cy.get('input[type="password"]').type('password123');

        cy.wait(500);
        cy.wait(1000);
        cy.get('button[type="submit"]').visualClick();
        cy.wait('@login');

        logStep("Welcome to the Dashboard. This is the central hub for all hospital management activities.");
        cy.location('pathname').should('eq', '/');
        cy.contains('Dashboard');
        cy.wait(2000);

        logStep("Here we can manage Appointments. Let's view the schedule.");
        cy.wait(1000);
        cy.get('a[href="/appointments"]').visualClick();
        cy.location('pathname').should('include', '/appointments');
        cy.contains('Appointments');
        cy.wait(2000);

        cy.wait(1000);
        cy.get('a[href="/"]').contains('Back to Dashboard').visualClick();
        cy.location('pathname').should('eq', '/');
        cy.wait(1000);

        logStep("Next, we browse our directory of specialized Doctors.");
        cy.wait(1000);
        cy.get('a[href="/doctors"]').visualClick();
        cy.location('pathname').should('include', '/doctors');
        cy.contains('Our Doctors');
        cy.wait(2000);

        cy.wait(1000);
        cy.get('a[href="/"]').contains('Back to Dashboard').visualClick();
        cy.location('pathname').should('eq', '/');
        cy.wait(1000);

        logStep("We can also access detailed Patient Medical Records securely.");
        cy.wait(1000);
        // Scroll down to reveal the card
        cy.scrollTo('bottom', { duration: 1000 });
        cy.wait(1000);
        cy.get('a[href="/records"]').visualClick();
        cy.location('pathname').should('include', '/records');
        cy.contains('Medical Records');
        cy.wait(2000);

        cy.wait(1000);
        cy.get('a[href="/"]').contains('Back to Dashboard').visualClick();
        cy.location('pathname').should('eq', '/');
        cy.wait(1000);

        logStep("Finally, we logout to ensure system security.");
        cy.wait(1000);
        // Scroll back up to find logout
        cy.scrollTo('top', { duration: 500 });
        cy.wait(500);
        cy.get('button').contains('Logout').visualClick();
        cy.location('pathname').should('include', '/login');
        cy.wait(2000);
    });
});
