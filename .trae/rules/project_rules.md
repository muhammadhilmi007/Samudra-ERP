<system_design>

- This is an Enterprise Resource Planning (ERP) system for PT. Sarana Mudah Raya (Samudra Paket), a logistics company in Indonesia

- The system uses microservice architecture with a monorepo structure

- The primary programming languages are JavaScript (backend and web frontend) and TypeScript (mobile)

- Backend uses Node.js with Express.js, web frontend uses Next.js, and mobile uses React Native with Expo

- The database is MongoDB with Mongoose ODM using Embedded Document pattern

- The system is deployed using Railway.com platform

</system_design>

<architecture_guidelines>

- Follow hexagonal architecture (ports and adapters) for backend services

- Separate domain logic from infrastructure and frameworks

- Implement feature-based organization for frontend code

- Use domain-driven design principles for modeling the business domain

- Implement event-driven communication between microservices

- Apply CQRS (Command Query Responsibility Segregation) pattern where appropriate

- Follow REST API design principles with consistent response formats

</architecture_guidelines>

<coding_standards>

- Use ESLint and Prettier for code formatting and quality

- Keep functions small (maximum 30 lines) and focused on a single responsibility

- Use early returns for error cases

- Follow naming conventions: camelCase for variables and functions, PascalCase for components and classes

- Include comprehensive JSDoc/TSDoc comments for all public APIs

- Write descriptive variable and function names that explain their purpose

- Use absolute imports with module aliases

- For UI components, use composition over inheritance

</coding_standards>

<file_structure>

- Maintain clear separation of backend services in `/backend/services/{service-name}`

- Keep frontend components organized by atomic design in `/frontend/src/components`

- Group feature-specific code in `/frontend/src/features/{feature-name}`

- Use consistent folder structure within each microservice

- Place shared code in `/shared` directory

- Store environment-specific configurations in appropriate config files

- Keep documentation updated in `/docs` directory

</file_structure>

<testing_requirements>

- Write unit tests for all business logic

- Implement integration tests for API endpoints

- Create end-to-end tests for critical user flows

- Use mock data and services for isolated testing

- Test for edge cases and error scenarios

- Maintain minimum 80% code coverage for new code

- Include accessibility tests for frontend components

</testing_requirements>

<performance_guidelines>

- Optimize database queries with proper indexing

- Implement caching strategies for frequently accessed data

- Use pagination for large data sets

- Create mobile-first responsive designs for web interfaces

- Implement code splitting for frontend applications

- Optimize bundle sizes with tree shaking

- Support offline-first operations in mobile applications

</performance_guidelines>

<security_guidelines>

- Implement proper authentication with JWT

- Apply role-based access control (RBAC) consistently

- Sanitize all user inputs to prevent injection attacks

- Use parameterized queries to prevent SQL/NoSQL injection

- Store sensitive data encrypted at rest

- Use HTTPS for all communications

- Implement proper password hashing with salt

- Set appropriate security headers in API responses

</security_guidelines>

<localization>

- Support both Bahasa Indonesia and English languages

- Use i18next for translation management

- Keep translation keys organized by feature

- Implement locale-specific formatting for dates, numbers, and currencies

- Use translation keys instead of hardcoded text

- Ensure all user-facing text is translatable

</localization>

<business_rules>

- A shipment can only be in one state at a time

- Shipments require proper documentation before loading

- CAD (Cash After Delivery) payments must have due dates

- Vehicle capacity must not be exceeded during loading

- Return must be approved before processing

- Billing cycle follows monthly periods

- Pickup addresses must be within service area

- Only authorized personnel can approve financial transactions

- All shipments must have valid waybill/STT numbers

- COD amounts must be reconciled daily 

</business_rules>

<integration_guidelines>

- Use adapter pattern for external service integrations

- Implement retry mechanisms for external API calls

- Document all integration points with examples

- Handle API versioning for external services

- Implement proper error handling for integration failures

- Use circuit breakers for critical external dependencies

- Keep API keys and secrets in environment variables

</integration_guidelines>

<mobile_guidelines>

- Design for offline-first operation

- Implement efficient data synchronization

- Use device features (camera, GPS) appropriately

- Optimize battery usage for background operations

- Support portrait orientation primarily

- Make touch targets appropriately sized (min 44x44 points)

- Implement graceful degradation for unavailable features 

</mobile_guidelines>

<documentation_requirements>

- Keep API documentation updated with OpenAPI/Swagger

- Document architectural decisions in ADRs

- Create and maintain user guides for each module

- Include code examples in technical documentation

- Document database schema with relationships

- Keep diagrams current with the implementation

- Document all environment variables and configurations

</documentation_requirements>
