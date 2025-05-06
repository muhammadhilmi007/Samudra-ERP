/**
 * Samudra Paket ERP - End-to-End Tests
 * Pickup Workflow E2E Tests
 */

describe('Pickup Workflow', () => {
  beforeEach(() => {
    // Login as admin user before each test
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/login');
    
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
    // Login with admin credentials
    cy.get('[data-testid="username-input"]').type('admin');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login to complete
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard');
  });

  describe('Pickup Request Creation', () => {
    it('should create a new pickup request successfully', () => {
      // Intercept API calls
      cy.intercept('POST', '/api/pickup-requests').as('createPickupRequest');
      cy.intercept('GET', '/api/customers*').as('getCustomers');
      
      // Navigate to pickup requests page
      cy.get('[data-testid="sidebar-pickup"]').click();
      cy.get('[data-testid="pickup-requests-link"]').click();
      cy.url().should('include', '/pickup-requests');
      
      // Click on create new pickup request button
      cy.get('[data-testid="create-pickup-request-btn"]').click();
      
      // Wait for customer data to load
      cy.wait('@getCustomers');
      
      // Fill pickup request form
      cy.get('[data-testid="customer-select"]').click().type('PT Example Customer{enter}');
      cy.get('[data-testid="pickup-date"]').type('2025-05-10');
      cy.get('[data-testid="pickup-time-start"]').type('09:00');
      cy.get('[data-testid="pickup-time-end"]').type('12:00');
      cy.get('[data-testid="pickup-address"]').type('Jl. Contoh No. 123, Jakarta Selatan');
      cy.get('[data-testid="contact-name"]').type('John Doe');
      cy.get('[data-testid="contact-phone"]').type('081234567890');
      cy.get('[data-testid="estimated-items"]').type('10');
      cy.get('[data-testid="notes"]').type('Please bring packaging materials');
      
      // Submit the form
      cy.get('[data-testid="submit-pickup-request"]').click();
      
      // Wait for API call to complete
      cy.wait('@createPickupRequest').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Pickup request created successfully');
      
      // Verify redirection to pickup requests list
      cy.url().should('include', '/pickup-requests');
      
      // Verify the new pickup request appears in the list
      cy.get('[data-testid="pickup-requests-table"]').should('contain', 'PT Example Customer');
    });
  });

  describe('Pickup Assignment', () => {
    it('should assign pickup requests to a team', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/pickup-requests*').as('getPickupRequests');
      cy.intercept('GET', '/api/employees*').as('getEmployees');
      cy.intercept('GET', '/api/vehicles*').as('getVehicles');
      cy.intercept('POST', '/api/pickup-assignments').as('createAssignment');
      
      // Navigate to pickup assignments page
      cy.get('[data-testid="sidebar-pickup"]').click();
      cy.get('[data-testid="pickup-assignments-link"]').click();
      cy.url().should('include', '/pickup-assignments');
      
      // Click on create new assignment button
      cy.get('[data-testid="create-assignment-btn"]').click();
      
      // Wait for data to load
      cy.wait('@getPickupRequests');
      cy.wait('@getEmployees');
      cy.wait('@getVehicles');
      
      // Fill assignment form
      cy.get('[data-testid="assignment-date"]').type('2025-05-10');
      
      // Select team members
      cy.get('[data-testid="driver-select"]').click().type('Driver Name{enter}');
      cy.get('[data-testid="helper-select"]').click().type('Helper Name{enter}');
      
      // Select vehicle
      cy.get('[data-testid="vehicle-select"]').click().type('B 1234 CD{enter}');
      
      // Select pickup requests to assign
      cy.get('[data-testid="pickup-request-checkbox-0"]').check();
      cy.get('[data-testid="pickup-request-checkbox-1"]').check();
      
      // Submit the form
      cy.get('[data-testid="submit-assignment"]').click();
      
      // Wait for API call to complete
      cy.wait('@createAssignment').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Pickup assignment created successfully');
      
      // Verify the new assignment appears in the list
      cy.get('[data-testid="assignments-table"]').should('contain', 'Driver Name');
    });
  });

  describe('Pickup Execution', () => {
    it('should process pickup items and complete pickup', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/pickup-assignments*').as('getAssignments');
      cy.intercept('GET', '/api/pickup-assignments/*/details').as('getAssignmentDetails');
      cy.intercept('POST', '/api/pickup-items').as('createPickupItem');
      cy.intercept('PATCH', '/api/pickup-requests/*/status').as('updateRequestStatus');
      
      // Navigate to pickup execution page
      cy.get('[data-testid="sidebar-pickup"]').click();
      cy.get('[data-testid="pickup-execution-link"]').click();
      cy.url().should('include', '/pickup-execution');
      
      // Wait for assignments to load
      cy.wait('@getAssignments');
      
      // Select an assignment to process
      cy.get('[data-testid="assignment-row-0"]').click();
      
      // Wait for assignment details to load
      cy.wait('@getAssignmentDetails');
      
      // Process pickup items
      cy.get('[data-testid="add-item-btn"]').click();
      
      // Fill item details
      cy.get('[data-testid="item-description"]').type('Electronics Package');
      cy.get('[data-testid="item-weight"]').type('5.5');
      cy.get('[data-testid="item-length"]').type('40');
      cy.get('[data-testid="item-width"]').type('30');
      cy.get('[data-testid="item-height"]').type('20');
      
      // Upload item photo
      cy.get('[data-testid="item-photo-upload"]').attachFile('test-image.jpg');
      
      // Add digital signature
      cy.get('[data-testid="signature-pad"]').trigger('mousedown', { clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 150 })
        .trigger('mouseup');
      
      // Save the item
      cy.get('[data-testid="save-item-btn"]').click();
      
      // Wait for API call to complete
      cy.wait('@createPickupItem').its('response.statusCode').should('eq', 201);
      
      // Add more items if needed
      // ...
      
      // Complete the pickup
      cy.get('[data-testid="complete-pickup-btn"]').click();
      
      // Confirm completion
      cy.get('[data-testid="confirm-completion-btn"]').click();
      
      // Wait for status update
      cy.wait('@updateRequestStatus').its('response.statusCode').should('eq', 200);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Pickup completed successfully');
      
      // Verify status change in the UI
      cy.get('[data-testid="pickup-status"]').should('contain', 'Completed');
    });
  });
});
