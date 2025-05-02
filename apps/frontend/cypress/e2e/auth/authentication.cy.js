/**
 * Samudra Paket ERP - End-to-End Tests
 * Authentication Flow E2E Tests
 */

describe('Authentication Flows', () => {
  beforeEach(() => {
    // Reset any previous authentication state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Visit the login page
    cy.visit('/login');
  });

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', () => {
      // Intercept the login API call
      cy.intercept('POST', '/api/auth/login').as('loginRequest');

      // Enter valid credentials
      cy.get('[data-testid="username-input"]').type('admin');
      cy.get('[data-testid="password-input"]').type('Password123!');

      // Submit the form
      cy.get('[data-testid="login-button"]').click();

      // Wait for the login API call to complete
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

      // Verify redirection to dashboard
      cy.url().should('include', '/dashboard');

      // Verify user is logged in (check for user info in header)
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should show error message with invalid credentials', () => {
      // Intercept the login API call
      cy.intercept('POST', '/api/auth/login').as('loginRequest');

      // Enter invalid credentials
      cy.get('[data-testid="username-input"]').type('admin');
      cy.get('[data-testid="password-input"]').type('WrongPassword123!');

      // Submit the form
      cy.get('[data-testid="login-button"]').click();

      // Wait for the login API call to complete
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);

      // Verify error message is displayed
      cy.get('[data-testid="login-error"]')
        .should('be.visible')
        .and('contain.text', 'Invalid username or password');

      // Verify still on login page
      cy.url().should('include', '/login');
    });

    it('should validate required fields', () => {
      // Try to submit the form without entering credentials
      cy.get('[data-testid="login-button"]').click();

      // Verify validation messages
      cy.get('[data-testid="username-error"]')
        .should('be.visible')
        .and('contain.text', 'Username is required');
      cy.get('[data-testid="password-error"]')
        .should('be.visible')
        .and('contain.text', 'Password is required');

      // Enter only username
      cy.get('[data-testid="username-input"]').type('admin');
      cy.get('[data-testid="login-button"]').click();

      // Verify only password validation remains
      cy.get('[data-testid="username-error"]').should('not.exist');
      cy.get('[data-testid="password-error"]').should('be.visible');

      // Clear and enter only password
      cy.get('[data-testid="username-input"]').clear();
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      // Verify only username validation remains
      cy.get('[data-testid="username-error"]').should('be.visible');
      cy.get('[data-testid="password-error"]').should('not.exist');
    });
  });

  describe('Registration Flow', () => {
    beforeEach(() => {
      // Navigate to registration page from login
      cy.get('[data-testid="register-link"]').click();
      cy.url().should('include', '/register');
    });

    it('should register a new user successfully', () => {
      // Intercept the registration API call
      cy.intercept('POST', '/api/auth/register').as('registerRequest');

      // Generate a unique email
      const uniqueId = Date.now();
      const email = `test${uniqueId}@example.com`;

      // Fill out registration form
      cy.get('[data-testid="fullName-input"]').type('Test User');
      cy.get('[data-testid="username-input"]').type(`testuser${uniqueId}`);
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="phoneNumber-input"]').type('081234567890');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirmPassword-input"]').type('Password123!');

      // Submit the form
      cy.get('[data-testid="register-button"]').click();

      // Wait for the registration API call to complete
      cy.wait('@registerRequest').its('response.statusCode').should('eq', 201);

      // Verify success message
      cy.get('[data-testid="registration-success"]')
        .should('be.visible')
        .and('contain.text', 'Registration successful');

      // Verify redirection to verification page
      cy.url().should('include', '/verify-email');
    });

    it('should validate password requirements', () => {
      // Fill out form with weak password
      cy.get('[data-testid="fullName-input"]').type('Test User');
      cy.get('[data-testid="username-input"]').type('testuser');
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="phoneNumber-input"]').type('081234567890');
      cy.get('[data-testid="password-input"]').type('password');
      cy.get('[data-testid="confirmPassword-input"]').type('password');

      // Submit the form
      cy.get('[data-testid="register-button"]').click();

      // Verify password validation message
      cy.get('[data-testid="password-error"]')
        .should('be.visible')
        .and(
          'contain.text',
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
        );

      // Try with mismatched passwords
      cy.get('[data-testid="password-input"]').clear().type('Password123!');
      cy.get('[data-testid="confirmPassword-input"]').clear().type('Password456!');
      cy.get('[data-testid="register-button"]').click();

      // Verify password mismatch message
      cy.get('[data-testid="confirmPassword-error"]')
        .should('be.visible')
        .and('contain.text', 'Passwords do not match');
    });

    it('should show error for duplicate username/email', () => {
      // Intercept the registration API call with mock response for duplicate username
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken',
          },
        },
      }).as('registerRequest');

      // Fill out registration form with existing username
      cy.get('[data-testid="fullName-input"]').type('Test User');
      cy.get('[data-testid="username-input"]').type('existinguser');
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="phoneNumber-input"]').type('081234567890');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirmPassword-input"]').type('Password123!');

      // Submit the form
      cy.get('[data-testid="register-button"]').click();

      // Verify error message
      cy.get('[data-testid="registration-error"]')
        .should('be.visible')
        .and('contain.text', 'Username is already taken');
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset', () => {
      // Navigate to forgot password page
      cy.get('[data-testid="forgot-password-link"]').click();
      cy.url().should('include', '/forgot-password');

      // Intercept the password reset request API call
      cy.intercept('POST', '/api/auth/request-password-reset').as('resetRequest');

      // Enter email
      cy.get('[data-testid="email-input"]').type('test@example.com');

      // Submit the form
      cy.get('[data-testid="reset-button"]').click();

      // Wait for the API call to complete
      cy.wait('@resetRequest').its('response.statusCode').should('eq', 200);

      // Verify success message
      cy.get('[data-testid="reset-success"]')
        .should('be.visible')
        .and('contain.text', 'Password reset instructions sent');
    });

    it('should reset password with valid token', () => {
      // Visit password reset page with token
      cy.visit('/reset-password?token=valid-reset-token');

      // Intercept the password reset API call
      cy.intercept('POST', '/api/auth/reset-password').as('passwordReset');

      // Enter new password
      cy.get('[data-testid="password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirmPassword-input"]').type('NewPassword123!');

      // Submit the form
      cy.get('[data-testid="submit-reset-button"]').click();

      // Wait for the API call to complete
      cy.wait('@passwordReset').its('response.statusCode').should('eq', 200);

      // Verify success message and redirection to login
      cy.get('[data-testid="reset-success"]')
        .should('be.visible')
        .and('contain.text', 'Password has been reset successfully');
      cy.url().should('include', '/login');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            token: 'fake-jwt-token',
            refreshToken: 'fake-refresh-token',
            user: {
              id: '1',
              username: 'admin',
              fullName: 'Admin User',
              email: 'admin@example.com',
            },
          },
        },
      }).as('loginRequest');

      // Login
      cy.get('[data-testid="username-input"]').type('admin');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      // Wait for login to complete and redirect to dashboard
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
    });

    it('should logout successfully', () => {
      // Intercept the logout API call
      cy.intercept('POST', '/api/auth/logout').as('logoutRequest');

      // Click on user menu
      cy.get('[data-testid="user-menu"]').click();

      // Click logout button
      cy.get('[data-testid="logout-button"]').click();

      // Wait for the logout API call to complete
      cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200);

      // Verify redirection to login page
      cy.url().should('include', '/login');

      // Verify local storage is cleared
      cy.window().then(window => {
        expect(window.localStorage.getItem('token')).to.be.null;
        expect(window.localStorage.getItem('refreshToken')).to.be.null;
      });
    });
  });

  describe('Session Management', () => {
    it('should refresh token when expired', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            token: 'fake-jwt-token',
            refreshToken: 'fake-refresh-token',
            user: {
              id: '1',
              username: 'admin',
              fullName: 'Admin User',
              email: 'admin@example.com',
            },
          },
        },
      }).as('loginRequest');

      // Login
      cy.get('[data-testid="username-input"]').type('admin');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      // Wait for login to complete and redirect to dashboard
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');

      // Intercept API call with expired token error
      cy.intercept('GET', '/api/users/profile', {
        statusCode: 401,
        body: {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token expired',
          },
        },
      }).as('expiredTokenRequest');

      // Intercept token refresh API call
      cy.intercept('POST', '/api/auth/refresh-token', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            token: 'new-jwt-token',
            refreshToken: 'new-refresh-token',
          },
        },
      }).as('refreshTokenRequest');

      // Intercept subsequent API call with new token
      cy.intercept('GET', '/api/users/profile', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: '1',
              username: 'admin',
              fullName: 'Admin User',
              email: 'admin@example.com',
            },
          },
        },
      }).as('profileRequest');

      // Trigger a profile fetch (which will fail with expired token)
      cy.window().then(window => {
        window.dispatchEvent(new Event('fetch-profile'));
      });

      // Wait for expired token request, refresh token request, and subsequent profile request
      cy.wait('@expiredTokenRequest');
      cy.wait('@refreshTokenRequest');
      cy.wait('@profileRequest');

      // Verify user is still logged in
      cy.get('[data-testid="user-menu"]').should('be.visible');

      // Verify new token is stored
      cy.window().then(window => {
        expect(window.localStorage.getItem('token')).to.equal('new-jwt-token');
        expect(window.localStorage.getItem('refreshToken')).to.equal('new-refresh-token');
      });
    });
  });
});
