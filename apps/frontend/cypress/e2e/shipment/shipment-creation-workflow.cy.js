/**
 * Samudra Paket ERP - End-to-End Tests
 * Shipment Creation Workflow E2E Tests
 */

describe('Shipment Creation Workflow', () => {
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

  describe('Inter-Branch Shipment Creation', () => {
    it('should create a new inter-branch shipment successfully', () => {
      // Intercept API calls
      cy.intercept('POST', '/api/inter-branch-shipments').as('createShipment');
      cy.intercept('GET', '/api/branches*').as('getBranches');
      cy.intercept('GET', '/api/vehicles*').as('getVehicles');
      cy.intercept('GET', '/api/employees*').as('getEmployees');
      cy.intercept('GET', '/api/warehouse-items*').as('getWarehouseItems');
      
      // Navigate to shipments page
      cy.get('[data-testid="sidebar-shipment"]').click();
      cy.get('[data-testid="inter-branch-shipments-link"]').click();
      cy.url().should('include', '/inter-branch-shipments');
      
      // Click on create new shipment button
      cy.get('[data-testid="create-shipment-btn"]').click();
      
      // Wait for data to load
      cy.wait('@getBranches');
      cy.wait('@getVehicles');
      cy.wait('@getEmployees');
      
      // Fill shipment form
      // Basic information
      cy.get('[data-testid="origin-branch-select"]').click().type('Jakarta Pusat{enter}');
      cy.get('[data-testid="destination-branch-select"]').click().type('Surabaya{enter}');
      cy.get('[data-testid="departure-date"]').type('2025-05-15');
      cy.get('[data-testid="departure-time"]').type('08:00');
      cy.get('[data-testid="estimated-arrival-date"]').type('2025-05-16');
      cy.get('[data-testid="estimated-arrival-time"]').type('14:00');
      
      // Vehicle and driver information
      cy.get('[data-testid="vehicle-select"]').click().type('B 9876 XY{enter}');
      cy.get('[data-testid="driver-select"]').click().type('Driver Name{enter}');
      cy.get('[data-testid="helper-select"]').click().type('Helper Name{enter}');
      
      // Add checkpoints
      cy.get('[data-testid="add-checkpoint-btn"]').click();
      cy.get('[data-testid="checkpoint-location-0"]').type('Semarang');
      cy.get('[data-testid="checkpoint-eta-date-0"]').type('2025-05-15');
      cy.get('[data-testid="checkpoint-eta-time-0"]').type('18:00');
      cy.get('[data-testid="checkpoint-notes-0"]').type('Rest and refuel');
      
      // Add another checkpoint
      cy.get('[data-testid="add-checkpoint-btn"]').click();
      cy.get('[data-testid="checkpoint-location-1"]').type('Madiun');
      cy.get('[data-testid="checkpoint-eta-date-1"]').type('2025-05-16');
      cy.get('[data-testid="checkpoint-eta-time-1"]').type('06:00');
      cy.get('[data-testid="checkpoint-notes-1"]').type('Driver change');
      
      // Go to next step (item selection)
      cy.get('[data-testid="next-step-btn"]').click();
      
      // Wait for warehouse items to load
      cy.wait('@getWarehouseItems');
      
      // Select items for shipment
      cy.get('[data-testid="item-checkbox-0"]').check();
      cy.get('[data-testid="item-checkbox-1"]').check();
      cy.get('[data-testid="item-checkbox-2"]').check();
      
      // Submit the form
      cy.get('[data-testid="submit-shipment"]').click();
      
      // Wait for API call to complete
      cy.wait('@createShipment').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Shipment created successfully');
      
      // Verify redirection to shipments list
      cy.url().should('include', '/inter-branch-shipments');
      
      // Verify the new shipment appears in the list
      cy.get('[data-testid="shipments-table"]').should('contain', 'Jakarta Pusat');
      cy.get('[data-testid="shipments-table"]').should('contain', 'Surabaya');
    });
  });

  describe('Shipment Manifest Generation', () => {
    it('should generate and print a shipment manifest', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/inter-branch-shipments*').as('getShipments');
      cy.intercept('GET', '/api/inter-branch-shipments/*/details').as('getShipmentDetails');
      cy.intercept('GET', '/api/inter-branch-shipments/*/manifest').as('getManifest');
      
      // Navigate to shipments page
      cy.get('[data-testid="sidebar-shipment"]').click();
      cy.get('[data-testid="inter-branch-shipments-link"]').click();
      cy.url().should('include', '/inter-branch-shipments');
      
      // Wait for shipments to load
      cy.wait('@getShipments');
      
      // Select a shipment
      cy.get('[data-testid="shipment-row-0"]').click();
      
      // Wait for shipment details to load
      cy.wait('@getShipmentDetails');
      
      // Click on generate manifest button
      cy.get('[data-testid="generate-manifest-btn"]').click();
      
      // Wait for manifest to generate
      cy.wait('@getManifest').its('response.statusCode').should('eq', 200);
      
      // Verify manifest is displayed
      cy.get('[data-testid="manifest-preview"]').should('be.visible');
      
      // Verify manifest content
      cy.get('[data-testid="manifest-preview"]').should('contain', 'SHIPMENT MANIFEST');
      cy.get('[data-testid="manifest-preview"]').should('contain', 'Jakarta Pusat');
      cy.get('[data-testid="manifest-preview"]').should('contain', 'Surabaya');
      
      // Verify print button is available
      cy.get('[data-testid="print-manifest-btn"]').should('be.visible');
      
      // Mock print function (since we can't test actual printing)
      cy.window().then((win) => {
        cy.stub(win, 'print').as('printStub');
      });
      
      // Click print button
      cy.get('[data-testid="print-manifest-btn"]').click();
      
      // Verify print was called
      cy.get('@printStub').should('be.called');
    });
  });

  describe('Shipment Tracking Updates', () => {
    it('should update shipment tracking information', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/inter-branch-shipments*').as('getShipments');
      cy.intercept('GET', '/api/inter-branch-shipments/*/details').as('getShipmentDetails');
      cy.intercept('PATCH', '/api/inter-branch-shipments/*/status').as('updateStatus');
      cy.intercept('POST', '/api/inter-branch-shipments/*/location').as('updateLocation');
      
      // Navigate to shipment tracking page
      cy.get('[data-testid="sidebar-shipment"]').click();
      cy.get('[data-testid="shipment-tracking-link"]').click();
      cy.url().should('include', '/shipment-tracking');
      
      // Wait for shipments to load
      cy.wait('@getShipments');
      
      // Select a shipment to track
      cy.get('[data-testid="shipment-row-0"]').click();
      
      // Wait for shipment details to load
      cy.wait('@getShipmentDetails');
      
      // Update shipment status
      cy.get('[data-testid="update-status-btn"]').click();
      cy.get('[data-testid="status-select"]').click().type('in_transit{enter}');
      cy.get('[data-testid="status-notes"]').type('Departed from origin branch');
      cy.get('[data-testid="submit-status-update"]').click();
      
      // Wait for status update
      cy.wait('@updateStatus').its('response.statusCode').should('eq', 200);
      
      // Verify status update
      cy.get('[data-testid="shipment-status"]').should('contain', 'In Transit');
      
      // Update location
      cy.get('[data-testid="update-location-btn"]').click();
      cy.get('[data-testid="location-latitude"]').type('-7.2575');
      cy.get('[data-testid="location-longitude"]').type('112.7521');
      cy.get('[data-testid="location-address"]').type('Jl. Raya Surabaya-Malang KM 10');
      cy.get('[data-testid="location-notes"]').type('On schedule');
      cy.get('[data-testid="submit-location-update"]').click();
      
      // Wait for location update
      cy.wait('@updateLocation').its('response.statusCode').should('eq', 200);
      
      // Verify location update
      cy.get('[data-testid="last-location"]').should('contain', 'Jl. Raya Surabaya-Malang KM 10');
      
      // Verify map is updated with new location
      cy.get('[data-testid="tracking-map"]').should('be.visible');
    });
  });
});
