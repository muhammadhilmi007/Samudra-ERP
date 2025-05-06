/**
 * Samudra Paket ERP - End-to-End Tests
 * Loading and Delivery Workflow E2E Tests
 */

describe('Loading and Delivery Workflow', () => {
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

  describe('Warehouse Item Processing', () => {
    it('should process incoming warehouse items', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/warehouse-items*').as('getWarehouseItems');
      cy.intercept('POST', '/api/warehouse-items').as('createWarehouseItem');
      
      // Navigate to warehouse operations page
      cy.get('[data-testid="sidebar-warehouse"]').click();
      cy.get('[data-testid="incoming-items-link"]').click();
      cy.url().should('include', '/warehouse/incoming-items');
      
      // Click on process new item button
      cy.get('[data-testid="process-new-item-btn"]').click();
      
      // Fill item processing form
      cy.get('[data-testid="item-source-select"]').click().type('Pickup{enter}');
      cy.get('[data-testid="pickup-id"]').type('PU12345678');
      cy.get('[data-testid="item-description"]').type('Electronics Package');
      cy.get('[data-testid="item-weight"]').type('5.5');
      cy.get('[data-testid="item-length"]').type('40');
      cy.get('[data-testid="item-width"]').type('30');
      cy.get('[data-testid="item-height"]').type('20');
      cy.get('[data-testid="destination-branch-select"]').click().type('Surabaya{enter}');
      cy.get('[data-testid="service-type-select"]').click().type('Regular{enter}');
      
      // Submit the form
      cy.get('[data-testid="submit-item"]').click();
      
      // Wait for API call to complete
      cy.wait('@createWarehouseItem').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Item processed successfully');
      
      // Verify the new item appears in the list
      cy.wait('@getWarehouseItems');
      cy.get('[data-testid="warehouse-items-table"]').should('contain', 'Electronics Package');
    });
  });

  describe('Item Allocation', () => {
    it('should allocate items to a shipment', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/warehouse-items*').as('getWarehouseItems');
      cy.intercept('GET', '/api/inter-branch-shipments*').as('getShipments');
      cy.intercept('POST', '/api/item-allocations').as('createAllocation');
      
      // Navigate to item allocation page
      cy.get('[data-testid="sidebar-warehouse"]').click();
      cy.get('[data-testid="item-allocation-link"]').click();
      cy.url().should('include', '/warehouse/item-allocation');
      
      // Wait for data to load
      cy.wait('@getWarehouseItems');
      cy.wait('@getShipments');
      
      // Select shipment to allocate items to
      cy.get('[data-testid="shipment-select"]').click().type('SH12345678{enter}');
      
      // Select items to allocate
      cy.get('[data-testid="item-checkbox-0"]').check();
      cy.get('[data-testid="item-checkbox-1"]').check();
      cy.get('[data-testid="item-checkbox-2"]').check();
      
      // Submit allocation
      cy.get('[data-testid="allocate-items-btn"]').click();
      
      // Wait for API call to complete
      cy.wait('@createAllocation').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Items allocated successfully');
      
      // Verify items are now allocated
      cy.wait('@getWarehouseItems');
      cy.get('[data-testid="allocation-status-0"]').should('contain', 'Allocated');
      cy.get('[data-testid="allocation-status-1"]').should('contain', 'Allocated');
      cy.get('[data-testid="allocation-status-2"]').should('contain', 'Allocated');
    });
  });

  describe('Loading Management', () => {
    it('should create and complete a loading manifest', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/item-allocations*').as('getAllocations');
      cy.intercept('POST', '/api/loading-manifests').as('createLoadingManifest');
      cy.intercept('PATCH', '/api/loading-manifests/*/status').as('updateManifestStatus');
      cy.intercept('GET', '/api/loading-manifests/*/items').as('getManifestItems');
      
      // Navigate to loading management page
      cy.get('[data-testid="sidebar-warehouse"]').click();
      cy.get('[data-testid="loading-management-link"]').click();
      cy.url().should('include', '/warehouse/loading-management');
      
      // Click on create new loading manifest button
      cy.get('[data-testid="create-loading-manifest-btn"]').click();
      
      // Select shipment for loading
      cy.get('[data-testid="shipment-select"]').click().type('SH12345678{enter}');
      
      // Wait for allocations to load
      cy.wait('@getAllocations');
      
      // Submit the form
      cy.get('[data-testid="create-manifest-btn"]').click();
      
      // Wait for API call to complete
      cy.wait('@createLoadingManifest').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Loading manifest created successfully');
      
      // Start loading process
      cy.get('[data-testid="start-loading-btn"]').click();
      
      // Wait for manifest items to load
      cy.wait('@getManifestItems');
      
      // Scan items (simulate barcode scanning)
      cy.get('[data-testid="barcode-input"]').type('WH12345678{enter}');
      cy.get('[data-testid="item-status-WH12345678"]').should('contain', 'Loaded');
      
      cy.get('[data-testid="barcode-input"]').type('WH87654321{enter}');
      cy.get('[data-testid="item-status-WH87654321"]').should('contain', 'Loaded');
      
      cy.get('[data-testid="barcode-input"]').type('WH11223344{enter}');
      cy.get('[data-testid="item-status-WH11223344"]').should('contain', 'Loaded');
      
      // Complete loading process
      cy.get('[data-testid="complete-loading-btn"]').click();
      
      // Confirm completion
      cy.get('[data-testid="confirm-completion-btn"]').click();
      
      // Wait for status update
      cy.wait('@updateManifestStatus').its('response.statusCode').should('eq', 200);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Loading completed successfully');
      
      // Verify loading manifest status
      cy.get('[data-testid="manifest-status"]').should('contain', 'Completed');
    });
  });

  describe('Delivery Management', () => {
    it('should create and complete a delivery order', () => {
      // Intercept API calls
      cy.intercept('GET', '/api/warehouse-items*').as('getWarehouseItems');
      cy.intercept('POST', '/api/delivery-orders').as('createDeliveryOrder');
      cy.intercept('GET', '/api/delivery-orders*').as('getDeliveryOrders');
      cy.intercept('GET', '/api/delivery-orders/*/details').as('getDeliveryDetails');
      cy.intercept('PATCH', '/api/delivery-orders/*/status').as('updateDeliveryStatus');
      
      // Navigate to delivery management page
      cy.get('[data-testid="sidebar-delivery"]').click();
      cy.get('[data-testid="delivery-orders-link"]').click();
      cy.url().should('include', '/delivery/orders');
      
      // Click on create new delivery order button
      cy.get('[data-testid="create-delivery-order-btn"]').click();
      
      // Wait for warehouse items to load
      cy.wait('@getWarehouseItems');
      
      // Fill delivery order form
      cy.get('[data-testid="delivery-date"]').type('2025-05-20');
      cy.get('[data-testid="driver-select"]').click().type('Driver Name{enter}');
      cy.get('[data-testid="vehicle-select"]').click().type('B 1234 CD{enter}');
      
      // Select items for delivery
      cy.get('[data-testid="item-checkbox-0"]').check();
      cy.get('[data-testid="item-checkbox-1"]').check();
      
      // Submit the form
      cy.get('[data-testid="submit-delivery-order"]').click();
      
      // Wait for API call to complete
      cy.wait('@createDeliveryOrder').its('response.statusCode').should('eq', 201);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Delivery order created successfully');
      
      // Navigate to delivery execution
      cy.get('[data-testid="delivery-execution-link"]').click();
      cy.url().should('include', '/delivery/execution');
      
      // Wait for delivery orders to load
      cy.wait('@getDeliveryOrders');
      
      // Select a delivery order to process
      cy.get('[data-testid="delivery-order-row-0"]').click();
      
      // Wait for delivery details to load
      cy.wait('@getDeliveryDetails');
      
      // Process delivery items
      cy.get('[data-testid="process-item-btn-0"]').click();
      
      // Fill delivery confirmation
      cy.get('[data-testid="recipient-name"]').type('Jane Doe');
      cy.get('[data-testid="recipient-relation"]').type('Customer');
      cy.get('[data-testid="delivery-notes"]').type('Left at front door');
      
      // Upload proof of delivery
      cy.get('[data-testid="pod-photo-upload"]').attachFile('test-image.jpg');
      
      // Add digital signature
      cy.get('[data-testid="signature-pad"]').trigger('mousedown', { clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 150 })
        .trigger('mouseup');
      
      // Submit delivery confirmation
      cy.get('[data-testid="confirm-delivery-btn"]').click();
      
      // Process second item
      cy.get('[data-testid="process-item-btn-1"]').click();
      
      // Fill delivery confirmation for second item
      cy.get('[data-testid="recipient-name"]').type('John Smith');
      cy.get('[data-testid="recipient-relation"]').type('Security');
      cy.get('[data-testid="delivery-notes"]').type('Handed to security');
      
      // Upload proof of delivery
      cy.get('[data-testid="pod-photo-upload"]').attachFile('test-image.jpg');
      
      // Add digital signature
      cy.get('[data-testid="signature-pad"]').trigger('mousedown', { clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 150 })
        .trigger('mouseup');
      
      // Submit delivery confirmation
      cy.get('[data-testid="confirm-delivery-btn"]').click();
      
      // Complete delivery order
      cy.get('[data-testid="complete-delivery-order-btn"]').click();
      
      // Confirm completion
      cy.get('[data-testid="confirm-completion-btn"]').click();
      
      // Wait for status update
      cy.wait('@updateDeliveryStatus').its('response.statusCode').should('eq', 200);
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain', 'Delivery order completed successfully');
      
      // Verify delivery order status
      cy.get('[data-testid="delivery-status"]').should('contain', 'Completed');
    });
  });
});
