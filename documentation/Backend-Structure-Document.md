# Backend Structure Document

## Architecture Overview

The backend of the Samudra Paket ERP system is designed using a microservice architecture with an API-first approach. This architecture provides scalability, maintainability, and allows for independent deployment of each service.

## System Architecture

### High-Level Architecture

The backend architecture is organized into several layers:

1.  API Gateway Layer

- Express.js API Gateway with JavaScript

- Authentication & Authorization based on Feature Permissions

- Rate Limiting & Caching

- API Documentation

- Request validation & transformation

- Circuit breaker pattern for fault tolerance

3.  Microservices Layer

- Core Services (User, Role, Branch, Division)

- Operational Services (Pickup, Shipment, Delivery)

- Financial Services (Payment, Invoice, Accounting)

- Reporting Services

- Each service with its own business logic

5.  Data Layer

- MongoDB Database (primary data store)

- Redis Cache (for performance optimization)

- File Storage (for documents and images)

- Data synchronization mechanisms

7.  Integration Layer

- External API Integrations (Maps, Payment Gateway, SMS/Email)

- Webhook Handlers

- Event Bus (for asynchronous communication between services)

- Adapter patterns for third-party integrations

### Low-Level Architecture

Each microservice follows a hexagonal architecture pattern with:

1.  API Layer

- Routes

- Controllers

- Input Validation

- Response Formatting

3.  Business Logic Layer

- Services

- Use Cases

- Domain Models

- Events

5.  Data Access Layer

- Repositories

- Data Models

- Query Builders

- Caching

7.  Infrastructure Layer

- Database Connectors

- External Service Clients

- File Storage

- Messaging

## Microservices Structure

### 1\. Core Services

#### 1.1 Auth Service

- User authentication (login, logout)

- JWT token management

- RBAC management

- Multi-factor authentication

#### 1.2 User Service

- User management

- Profile management

- Role & permission management

- Password management

#### 1.3 Master Data Service

- Branch management

- Division management

- Employee management

- Service area management

- Forwarder partner management

### 2\. Operational Services

#### 2.1 Pickup Service

- Pickup request management

- Pickup assignment

- Pickup execution

- Pickup verification

#### 2.2 Shipment Service

- Shipment order management

- Loading management

- Inter-branch shipment

- Shipment tracking

#### 2.3 Delivery Service

- Delivery planning

- Route optimization

- Delivery execution

- Proof of delivery

#### 2.4 Return Service

- Return request management

- Return processing

- Return tracking

- Return resolution

#### 2.5 Vehicle Service

- Vehicle management

- Maintenance scheduling

- Vehicle assignment

- Fuel consumption tracking

### 3\. Financial Services

#### 3.1 Sales Service

- Invoice generation

- Pricing calculation

- Payment method handling

- Customer management

#### 3.2 Payment Service

- Payment processing

- Payment verification

- Payment gateway integration

- Receipt generation

#### 3.3 Billing Service

- Billing management

- Debt collection

- Aging reports

- Payment reminders

#### 3.4 Accounting Service

- Journal entries

- General ledger

- Financial statements

- Asset management

### 4\. Supporting Services

#### 4.1 Notification Service

- Email notifications

- SMS notifications

- Push notifications

- In-app notifications

#### 4.2 Reporting Service

- Report generation

- Data aggregation

- Analytics

- Dashboard metrics

#### 4.3 Integration Service

- External API integration

- Webhook handling

- Data synchronization

- File processing

## Service Structure

Each microservice follows a consistent directory structure:

/service-name

├── /src

│   ├── /api                    # API Layer

│   │   ├── /controllers        # Request handlers

│   │   ├── /routes             # Route definitions

│   │   ├── /middlewares        # API middlewares

│   │   └── /validations        # Input validation

│   │

│   ├── /domain                 # Domain Layer

│   │   ├── /models             # Domain models

│   │   ├── /services           # Domain services

│   │   ├── /events             # Domain events

│   │   └── /errors             # Domain errors

│   │

│   ├── /infrastructure         # Infrastructure Layer

│   │   ├── /repositories       # Data access

│   │   ├── /database           # DB config & models

│   │   ├── /external           # External services

│   │   └── /queues             # Message queues

│   │

│   ├── /app                    # Application Layer

│   │   ├── /use-cases          # Business logic

│   │   ├── /commands           # Command handlers

│   │   ├── /queries            # Query handlers

│   │   └── /dtos               # Data Transfer Objects

│   │

│   └── /config                 # Service configuration

│

├── /tests                      # Tests

│   ├── /unit                   # Unit tests

│   ├── /integration            # Integration tests

│   └── /e2e                    # End-to-end tests

│

├── package.json                # Dependencies

└── Dockerfile                  # Docker configuration

## API Gateway

The API Gateway serves as the entry point for all client requests and provides several key functionalities:

### Key Features

1.  Routing

- Routes client requests to appropriate microservices

- Handles API versioning

- Manages endpoint documentation

3.  Authentication & Authorization

- Validates JWT tokens

- Enforces role-based access control

- Manages user sessions

5.  Request/Response Processing

- Validates request formats

- Transforms responses to consistent formats

- Handles error responses

7.  Cross-Cutting Concerns

- Rate limiting to prevent abuse

- Request logging for auditing

- Response caching for performance

- CORS handling

### API Routing Example

// Route definitions for User Service

router.post('/api/users', authMiddleware, validateUserSchema, userController.createUser);

router.get('/api/users', authMiddleware, userController.getUsers);

router.get('/api/users/:id', authMiddleware, userController.getUserById);

router.put('/api/users/:id', authMiddleware, validateUserSchema, userController.updateUser);

router.delete('/api/users/:id', authMiddleware, userController.deleteUser);

## API Design

The API follows RESTful principles and is designed to be consistent, intuitive, and scalable.

### API Standards

1.  Resource-Oriented Design

- APIs represent resources (nouns, not verbs)

- HTTP methods represent actions (GET, POST, PUT, DELETE)

- Nested resources use hierarchical URLs

3.  URL Structure

- Base URL: /api/v1

- Resource collections: /api/v1/resources

- Specific resource: /api/v1/resources/:id

- Nested resources: /api/v1/resources/:id/sub-resources

5.  Request Methods

- GET: Retrieve resources

- POST: Create resources

- PUT: Update resources

- DELETE: Remove resources

7.  Response Status Codes

- 200: Success

- 201: Created

- 400: Bad Request

- 401: Unauthorized

- 403: Forbidden

- 404: Not Found

- 500: Internal Server Error

### Request Format

{

"property1": "value1",

"property2": "value2",

"nestedObject": {

"nestedProperty": "nestedValue"

},

"arrayProperty": \[

"item1",

"item2"

\]

}

### Response Format

Success Response:

{

"success": true,

"data": {

// Resource data or array of resources

},

"meta": {

"pagination": {

"page": 1,

"limit": 10,

"totalItems": 100,

"totalPages": 10

}

}

}

Error Response:

{

"success": false,

"error": {

"code": "ERROR_CODE",

"message": "Human readable error message",

"details": {

// Additional error details

}

}

}

## Database Design

### MongoDB Data Model

The system uses MongoDB as the primary database with Mongoose ODM and Embedded Document pattern. Below are the key collections and their structure:

#### Core Collections

1.  users

{

\_id: ObjectId,

username: String,

email: String,

passwordHash: String,

salt: String,

firstName: String,

lastName: String,

phoneNumber: String,

role: ObjectId,

branch: ObjectId,

position: ObjectId,

status: String,

lastLogin: Date,

mfaEnabled: Boolean,

mfaSecret: String,

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

2.  roles

{

\_id: ObjectId,

name: String,

description: String,

permissions: \[String\],

isSystem: Boolean,

status: String,

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

3.  branches

{

\_id: ObjectId,

code: String,

name: String,

type: String,

address: {

street: String,

city: String,

district: String,

province: String,

postalCode: String,

country: String

},

contact: {

phone: String,

email: String,

fax: String

},

manager: ObjectId,

parent: ObjectId,

status: String,

location: {

type: "Point",

coordinates: \[Number, Number\]  // \[longitude, latitude\]

},

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

#### Operational Collections

1.  pickupRequests

{

\_id: ObjectId,

requestCode: String,

customer: ObjectId,

branch: ObjectId,

pickupAddress: {

street: String,

city: String,

district: String,

province: String,

postalCode: String,

country: String,

location: {

type: "Point",

coordinates: \[Number, Number\]

}

},

contactName: String,

contactPhone: String,

requestDate: Date,

scheduledDate: Date,

scheduledTimeWindow: {

start: String,

end: String

},

estimatedItems: Number,

estimatedWeight: Number,

notes: String,

status: String,

assignment: ObjectId,

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

2.  shipmentOrders

{

\_id: ObjectId,

waybillNo: String,

branch: ObjectId,

sender: {

customer: ObjectId,

name: String,

address: {

street: String,

city: String,

district: String,

province: String,

postalCode: String,

country: String

},

phone: String,

email: String

},

receiver: {

name: String,

address: {

street: String,

city: String,

district: String,

province: String,

postalCode: String,

country: String

},

phone: String,

email: String

},

originBranch: ObjectId,

destinationBranch: ObjectId,

serviceType: String,

paymentType: String,

forwarderCode: String,

items: \[

{

description: String,

quantity: Number,

weight: Number,

volume: Number,

value: Number

}

\],

totalItems: Number,

totalWeight: Number,

totalVolume: Number,

amount: {

baseRate: Number,

additionalServices: Number,

insurance: Number,

tax: Number,

discount: Number,

total: Number

},

pickupRequest: ObjectId,

status: String,

statusHistory: \[

{

status: String,

timestamp: Date,

location: String,

notes: String,

user: ObjectId

}

\],

documents: \[

{

type: String,

fileUrl: String,

uploadedAt: Date

}

\],

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

#### Financial Collections

1.  journals

{

\_id: ObjectId,

journalNo: String,

journalDate: Date,

description: String,

reference: String,

referenceType: String,

referenceId: ObjectId,

totalDebit: Number,

totalCredit: Number,

status: String,

branch: ObjectId,

entries: \[

{

account: ObjectId,

description: String,

debit: Number,

credit: Number

}

\],

createdAt: Date,

updatedAt: Date,

createdBy: ObjectId,

updatedBy: ObjectId

}

### Indexing Strategy

To optimize query performance, the following indexes will be implemented:

#### Core Collections

- users: { username: 1 }, { email: 1 }, { branch: 1, status: 1 }

- roles: { name: 1 }

- branches: { code: 1 }, { status: 1 }, { "location": "2dsphere" }

#### Operational Collections

- pickupRequests: { requestCode: 1 }, { customer: 1 }, { branch: 1, status: 1 }, { scheduledDate: 1, status: 1 }

- shipmentOrders: { waybillNo: 1 }, { "sender.customer": 1 }, { originBranch: 1 }, { destinationBranch: 1 }, { status: 1 }, { createdAt: 1, status: 1 }

#### Financial Collections

- journals: { journalNo: 1 }, { journalDate: 1 }, { branch: 1, status: 1 }, { referenceType: 1, referenceId: 1 }

### Data Relationships

MongoDB is a NoSQL database that doesn't support relations like relational databases, but relationships will be implemented through:

1.  Document References

- For one-to-many and many-to-many relationships

- Example: references using ObjectId to other collections

3.  Embedded Documents

- For one-to-few relationships and data always accessed together

- Example: status history in shipmentOrders

5.  Denormalization

- For frequently read but rarely changed data

- Example: storing sender/receiver information in shipmentOrders

## Authentication & Authorization

### Authentication

The system uses JSON Web Tokens (JWT) for authentication:

1.  Authentication Flow

- User logs in with credentials

- Server validates credentials and generates JWT

- JWT contains user ID, role, and permissions

- JWT is signed with a secret key

- JWT is sent to client and stored

- JWT is included in every request as Authorization header

3.  Token Refresh Mechanism

- Access token with short lifetime (1 hour)

- Refresh token with longer lifetime (7 days)

- Refresh endpoint to get new access token

- Secure storage methods

### Authorization

The system uses Role-Based Access Control (RBAC) with feature-based permissions:

1.  Roles

- Super Admin: Full access to all system features

- Admin: Access to administrative features

- Manager: Access to management features

- Operator: Access to operational features

- User: Limited access to basic features

3.  Permissions

- Resource-based permissions (users.create, users.read)

- Action-based permissions (create, read, update, delete)

- Scope-based permissions (own, branch, all)

5.  Permission Checking

- Middleware checks user permissions before allowing access

- Denies access if permissions are insufficient

- Returns appropriate error message

## Error Handling

The system implements a centralized error handling mechanism:

1.  Error Types

- ValidationError: Invalid input data

- AuthenticationError: Authentication failures

- AuthorizationError: Permission issues

- NotFoundError: Resource not found

- ConflictError: Resource conflicts

- SystemError: Internal system errors

3.  Error Response Structure

{

"success": false,

"error": {

"code": "ERROR_CODE",

"message": "Human readable error message",

"details": {

// Additional error details

}

}

}

3.  Error Logging

- All errors are logged with context information

- Critical errors trigger notifications

- Error logs are aggregated and analyzed

## Middleware

The system uses several middleware components:

1.  Authentication Middleware

- Verifies JWT token

- Extracts user information

- Handles token expiration

3.  Authorization Middleware

- Checks user permissions

- Enforces role-based access

- Validates resource ownership

5.  Validation Middleware

- Validates request body

- Sanitizes input

- Provides validation errors

7.  Error Handling Middleware

- Catches and processes errors

- Formats error responses

- Logs errors appropriately

9.  Logging Middleware

- Logs request details

- Tracks response times

- Captures error details

11. Request ID Middleware

- Assigns unique ID to each request

- Enables request tracing across services

- Enhances debugging

13. CORS Middleware

- Manages Cross-Origin Resource Sharing

- Configures allowed origins

- Handles preflight requests

15. Rate Limiting Middleware

- Prevents abuse

- Manages API quotas

- Protects against DoS attacks

17. Compression Middleware

- Compresses response data

- Reduces bandwidth usage

- Improves response times

19. Caching Middleware

- Caches responses

- Reduces database load

- Improves response times

## API Documentation

The API is documented using Swagger/OpenAPI, providing:

1.  API Overview

- General description

- Authentication requirements

- Base URL information

3.  Endpoint Documentation

- Resource descriptions

- Request methods

- URL parameters

- Request body schema

- Response schema

- Error responses

5.  Interactive Testing

- Try out API endpoints

- View request/response examples

- Generate client code

7.  Authentication Guide

- How to authenticate

- How to maintain sessions

- How to handle token refresh

## Deployment and Environment

The system will be deployed using Railway.com with:

1.  Multiple Environments

- Development environment (for active development)

- Staging environment (for testing)

- Production environment (for live system)

3.  Environment Configuration

- Environment-specific variables

- Secrets management

- Feature flags

5.  Continuous Integration/Deployment

- Automated builds

- Test automation

- Deployment pipeline

- Rollback capability

## Monitoring and Logging

The system implements comprehensive monitoring and logging:

1.  Centralized Logging

- Structured log format

- Log aggregation

- Log search and analysis

- Log retention policies

3.  Performance Monitoring

- API response times

- Database query performance

- Resource utilization

- Error rates

5.  Health Checks

- Service availability

- Database connectivity

- External service status

- Memory and CPU usage

7.  Alerting

- Threshold-based alerts

- Anomaly detection

- Alert escalation

- On-call rotation

## External Service Integration

The system integrates with several external services:

1.  Payment Gateway

- Payment processing

- Payment verification

- Refund processing

- Reconciliation

3.  Maps Service

- Geocoding

- Route optimization

- Distance calculation

- Location tracking

5.  SMS/Email Service

- Notification delivery

- Templated messages

- Delivery status tracking

- Scheduled messages

7.  File Storage

- Document storage

- Image storage

- Secure access control

- Backup and recovery

## Recommended Backend Development Practices

1.  Code Quality

- Follow JavaScript best practices

- Use ESLint for code linting

- Implement code reviews

- Maintain consistent code style

3.  Security

- Input validation

- Output encoding

- Prevent injection attacks

- Regular dependency updates

5.  Testing

- Unit testing for business logic

- Integration testing for APIs

- End-to-end testing for critical flows

- Performance testing for scalability

7.  Documentation

- Code documentation

- API documentation

- Architecture documentation

- Operational documentation

9.  Version Control

- Feature branching

- Pull request workflow

- Semantic versioning

- Meaningful commit messages

11. Performance Optimization

- Database query optimization

- Caching strategies

- Asynchronous processing

- Resource pooling
