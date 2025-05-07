# Project Requirement Document

## Introduction

This document outlines the comprehensive requirements for the Enterprise Resource Planning (ERP) system for PT. Sarana Mudah Raya (Samudra Paket). It serves as a reference for all stakeholders involved in the development and implementation of the system.

## Project Scope

The ERP system aims to integrate all business processes of PT. Sarana Mudah Raya, including operations, administration, finance, and management. The system will consist of a web application and mobile applications, with a focus on providing real-time visibility, improving operational efficiency, and enabling data-driven decision making.

## Functional Requirements

### 1\. Authentication and Authorization Module

#### 1.1 User Management

- System administrators can register new users with basic information (name, username, email, branch, division, position)
- Users can view and update their profile information
- Users can reset their password through email verification
- Administrators can activate and deactivate user accounts

#### 1.2 Authentication

- Users can log in to the system with username/email and password
- Mobile application provides secure login with "remember me" option
- Two-factor authentication for accounts with high-level access
- Session management with automatic timeout after inactivity period
- Users can securely log out from all devices

#### 1.3 Role-Based Access Control (RBAC)

- System supports defining user roles (Director, Manager, Branch Head, Warehouse Head, Staff, etc.)
- Administrators can set specific access rights for each role to system modules and functions
- Access restrictions based on branch, except for certain roles (Director, Manager)
- Temporary authority delegation for specific functions (e.g., during leave/illness)

#### 1.4 Audit and Security

- System logs all significant user activities (login, logout, important data modifications)
- System records all unauthorized access attempts and suspicious activities
- Administrators can view and export audit trail reports for specific periods

### 2\. Dashboard Module

#### 2.1 Executive Dashboard

- Display summary of key company KPIs (revenue, shipping volume, profitability)
- Financial highlights (cash flow, revenue, costs) with visualizations
- Operational performance metrics (on-time rate, volume, efficiency)
- Customer metrics (acquisition, retention, satisfaction)
- HR metrics (productivity, turnover)

#### 2.2 Operational Dashboard

- Daily shipment volume with trends
- Pickup performance (on-time rate, average time)
- Delivery performance (on-time rate, first-time-right delivery)
- Warehouse utilization (cross-dock efficiency, storage time)
- Fleet performance (utilization rate, fuel efficiency)

#### 2.3 Financial Dashboard

- Revenue tracking (by service type, customer segment, region)
- Cost analysis (fixed vs. variable, cost per shipment, by department)
- Working capital metrics (AR aging, AP aging, cash conversion cycle)
- Profitability metrics (gross margin, EBITDA margin)

#### 2.4 Customer Dashboard

- Customer acquisition metrics (new customers, cost per acquisition)
- Customer retention metrics (retention rate, churn rate)
- Customer satisfaction metrics (NPS score, complaint resolution rate)
- Customer profitability metrics (revenue per customer, cost to serve)

#### 2.5 HR Dashboard

- Workforce metrics (headcount by department, turnover rate)
- Performance metrics (KPI achievement rate, training completion rate)
- Employee engagement metrics (satisfaction score, participation rate)

#### 2.6 Dashboard Features

- Filtering by time period, branch, and other relevant parameters
- Drill-down capability to underlying details
- Export to common formats (PDF, Excel)
- Alerts and notifications for KPIs exceeding thresholds

### 3\. Branch & Division Management Module

#### 3.1 Branch Management

- Register new branches with detailed information (name, address, contact, service area)
- Modify existing branch information
- Activate/deactivate branches
- Branch hierarchy structure (headquarters, regional, branch)
- Branch profile with performance and statistics

#### 3.2 Division Management

- Register new divisions (Operations, Administration, Finance, etc.)
- Modify existing division information
- Activate/deactivate divisions
- Organizational structure by division and branch

#### 3.3 Service Area Management

- Register service areas per branch (province, city, district, sub-district)
- Modify branch service areas
- Verify if an address is within a branch's service area
- Visual mapping of branch service areas

#### 3.4 Forwarding Partner Management

- Register forwarding partners with service areas
- Modify forwarding partner information
- Activate/deactivate partners
- Manage forwarding rates
- Determine if a shipping destination requires a forwarding partner

### 4\. Employee Management Module

#### 4.1 Employee Data

- Register new employees with detailed information (personal, contact, position, branch)
- Modify existing employee information
- Activate/deactivate employees
- Employee profile with position history and performance
- Search and filter employees by various criteria

#### 4.2 Organizational Structure

- Define positions in the organizational structure
- Allocate employees to positions
- Store position history for employees
- Visual representation of organizational structure (org chart)

#### 4.3 Attendance and Assignment

- Record employee attendance (present, absent, permitted leave, sick)
- Manage shift assignments for operational positions
- Assign employees to specific tasks (pickup, loading, delivery)
- Monitor team attendance
- Generate attendance reports for payroll calculation

#### 4.4 Performance and Evaluation

- Define KPIs for each position
- Record employee performance against KPIs
- Conduct periodic evaluations (monthly, quarterly, annual)
- Employee performance dashboard

### 5\. Pickup Management Module

#### 5.1 Pickup Request

- Register pickup requests from customers with detailed information
- Validate whether pickup address is within service area
- Assign pickup team (driver and helper) to requests
- Optimize routes for multiple pickups in one assignment
- Send notifications to pickup team about new assignments

#### 5.2 Pickup Execution

- Confirm departure through mobile app
- Navigate to pickup location
- Real-time status updates (en route, arrived at location)
- Arrival confirmation at pickup location

#### 5.3 Item Verification and Documentation

- Verify item type, quantity, and condition at location
- Photo documentation through mobile app
- Digital pickup form completion
- Verify and scan sender documents (shipping documents)
- Estimate item weight and dimensions

#### 5.4 Pickup Completion

- Confirm item collection
- Update return journey status
- Confirm arrival at branch
- Transfer to checker
- Generate pickup report

### 6\. Sales and Waybill Creation Module

#### 6.1 Customer Data

- Register new customers with detailed information
- Quick search for existing customer data
- Modify existing customer information
- Store and display customer transaction history
- Customer segmentation based on volume, value, and transaction frequency

#### 6.2 Waybill/STT Creation

- Input detailed shipping data (sender, receiver, items, service)
- Validate destination for service area or forwarding requirement
- Automatic shipping cost calculation based on weight, distance, and service type
- Automatic waybill/STT numbering with standardized format
- Payment method selection (CASH, COD, CAD)
- Print waybill/STT in standard format (6 sheets)
- Electronic distribution of waybill to relevant parties

#### 6.3 Payment Management

- Record CASH payments from customers
- Record COD shipments
- Record CAD shipments with due dates
- Validate payments against required amounts
- Generate payment receipts for customers

#### 6.4 Sales Reporting

- Generate daily sales reports
- Generate reports by payment method
- Generate reports by destination
- Sales reconciliation with received cash
- Real-time sales dashboard

### 7\. Vehicle Management Module

#### 7.1 Vehicle Data

- Register new vehicles with detailed information (type, brand, license plate, capacity)
- Modify existing vehicle information
- Activate/deactivate vehicles
- Allocate vehicles to branches
- Search and filter vehicles by various criteria

#### 7.2 Vehicle Maintenance

- Schedule routine maintenance for vehicles
- Record maintenance history
- Send notifications for upcoming maintenance
- Report vehicle condition

#### 7.3 Vehicle Usage

- Book vehicles for specific tasks (pickup, delivery, inter-branch)
- Assign drivers to vehicles for each usage
- Log vehicle usage (start time, end time, distance)
- Real-time monitoring of vehicle status and location
- Calculate vehicle utilization rate

#### 7.4 Fuel and Cost Management

- Record vehicle refueling (date, amount, cost)
- Record vehicle operational costs
- Analyze fuel consumption by vehicle and driver
- Generate vehicle cost reports

### 8\. Loading & Delivery Management Module

#### 8.1 Item Receipt and Checking

- Receive and verify items from courier
- Weigh and measure items accurately
- Verify item documents (shipping documents, pickup forms)
- Record received items in digital master receipt book
- Validate items against shipping documents

#### 8.2 Item Loading

- Create digital loading forms
- Allocate items to trucks by destination
- Assign loading team for specific trucks
- Confirm that items have been loaded onto trucks
- Optimize loading based on capacity and destination

#### 8.3 Inter-Branch Shipping

- Calculate revenue per truck based on loaded items
- Validate whether truck revenue meets minimum target
- Facilitate coordination between branches for load consolidation
- Generate shipping documents (DMB, Truck Shipment Report)
- Calculate inter-branch shipping costs
- Track truck journeys between branches
- Confirm departure through mobile app
- Real-time journey status updates

#### 8.4 Receipt at Destination Branch

- Notify destination branch of ETA
- Confirm arrival at destination branch
- Verify received documents
- Verify received items
- Record discrepancies between documents and received items
- Destination branch warehouse head confirms receipt

#### 8.5 Delivery to Receiver

- Allocate items to delivery vehicles by area
- Optimize delivery routes for efficiency
- Generate delivery documents
- Assign delivery team for specific deliveries
- Route navigation through mobile app
- Real-time delivery status updates

#### 8.6 Receiver Acceptance

- Verify receiver identity
- Confirm item receipt with digital signature
- Photo documentation through mobile app
- Handle COD payments
- Record CAD for future collection
- Generate electronic proof of delivery
- Update shipment status to "Delivered"

### 9\. Returns Management Module

#### 9.1 Return Recording

- Initiate returns when items cannot be delivered
- Record detailed return reasons (receiver not present, address not found, item rejected)
- Document return condition and situation through mobile app
- Warehouse head approves or rejects return requests
- Send return notifications to sender

#### 9.2 Return Item Handling

- Checker receives and verifies returned items at warehouse
- Record returned item condition
- Store returned items at warehouse with location recording
- Special labeling for returned items
- Track returned item status and location

#### 9.3 Return Resolution

- Support various resolution options (re-delivery, return to sender, disposal)
- Record sender approval for resolution option
- Facilitate re-delivery of returned items with new waybill
- Facilitate return to sender
- Document return resolution

#### 9.4 Return Reporting and Analysis

- Generate daily return reports
- Analyze return causes for problem identification
- Generate return statistics by geographic area
- Generate return statistics by reason
- Calculate financial impact of returns

### 10\. Billing Module

#### 10.1 Receivables Management

- Record all CAD shipments as receivables
- Categorize receivables by age (current, 1-30 days, 31-60 days, 61-90 days, >90 days)
- Set credit limits for CAD customers
- Send alerts for receivables approaching or past due dates
- Reconcile receivables with received payments

#### 10.2 Collection Scheduling

- Identify invoices ready for collection
- Create collection schedules for debt collectors
- Optimize collection routes based on customer locations
- Assign invoices to specific debt collectors
- Send collection schedule notifications to debt collectors

#### 10.3 Collection Execution

- Generate collection documents (invoices, collection lists)
- Record customer visits
- Record visit results (successful, failed, payment promise)
- Document visit proof through mobile app
- Record payments received from customers

#### 10.4 Collection Completion

- Validate received payments against invoice amounts
- Generate payment receipts for customers
- Update receivable status after payment
- Record partial payments
- Generate daily collection reports

#### 10.5 Problematic Receivables Escalation

- Identify problematic receivables based on age and history
- Escalate problematic receivables to higher management levels
- Record resolution actions for problematic receivables
- Adjust customer credit status based on payment history
- Generate problematic receivables reports for management

### 11\. Finance and Accounting Module

#### 11.1 Cash Management

- Record all cash inflows with source details
- Record all cash outflows with usage details
- Validate cash transactions (authorization, documentation, amount validation)
- Display real-time cash balance
- Support daily cash reconciliation between system and physical cash
- Generate cash reports (daily, weekly, monthly)

#### 11.2 Bank Management

- Record all bank transactions (deposits, withdrawals, transfers)
- Validate bank transfers
- Support bank reconciliation with bank statements
- Support multiple bank accounts
- Display real-time bank balances
- Generate bank transaction reports

#### 11.3 Journal and Ledger

- Manage chart of accounts
- Automatically generate journals from business transactions
- Support manual journal entries for adjustments
- Validate journals (debit = credit)
- Automatically post journals to general ledger
- Support periodic closing (monthly, yearly)
- Maintain audit trail for all accounting transactions

#### 11.4 Financial Reporting

- Generate balance sheet (monthly, quarterly, annual)
- Generate income statement (monthly, quarterly, annual)
- Generate cash flow statement
- Generate statement of changes in equity
- Consolidate financial reports from all branches
- Export reports to common formats (Excel, PDF)

#### 11.5 Asset Management

- Register new assets with detailed information
- Calculate asset depreciation automatically
- Record asset sales/disposal
- Support asset revaluation
- Generate asset reports

#### 11.6 Tax Management

- Calculate relevant taxes (income tax, VAT)
- Record tax-related transactions
- Generate tax reports for reporting purposes
- Support tax reconciliation

### 12\. HR Management Module

#### 12.1 Employee Database

- Maintain comprehensive employee database
- Display detailed employee profiles
- Store employee position history
- Store important employee documents (contracts, certificates)
- Search employees by various criteria

#### 12.2 Attendance Management

- Record employee attendance (present, late, absent, permitted, sick)
- Support leave and permission approval process
- Calculate effective working hours
- Generate attendance reports for payroll calculation
- Attendance dashboard for supervisors

#### 12.3 Payroll and Compensation

- Define salary structures by position
- Support multiple salary components (base salary, allowances, bonuses)
- Calculate wages based on attendance and performance
- Generate pay slips for each employee
- Record salary payments to employees
- Generate payroll reports for accounting purposes

#### 12.4 Performance Management

- Set KPIs for each position
- Facilitate periodic performance evaluations
- Support performance feedback
- Create employee development plans
- Generate employee performance reports

#### 12.5 Training and Development

- Maintain training program catalog
- Support employee registration for training
- Record employee training history
- Evaluate training effectiveness
- Generate training reports

### 13\. Reporting Module

#### 13.1 Operational Reports

- Daily shipment reports
- Pickup activity reports
- Loading reports
- Delivery reports
- Return reports
- Branch performance reports
- Vehicle utilization reports

#### 13.2 Financial Reports

- Revenue reports (daily, weekly, monthly)
- Operational cost reports
- Cash and bank reports
- Receivables reports with aging
- Tax reports
- Profit and loss reports
- Profitability reports by service/branch

#### 13.3 Customer Reports

- Customer acquisition reports
- Customer shipping activity reports
- Customer profitability reports
- Customer payment behavior reports
- Customer complaint reports

#### 13.4 Management Reports

- Executive summary reports
- KPI achievement reports
- Business trend reports (monthly, quarterly, annual)
- Predictive reports based on historical data analysis
- Branch comparison reports

#### 13.5 Custom Report Generator

- Report builder for custom reports
- Report template creation and storage
- Multi-format export (PDF, Excel, CSV)
- Automatic report scheduling
- Automatic report distribution via email

### 14\. Tracking and Monitoring Module

#### 14.1 Shipment Tracking

- Track shipment status by waybill number
- Manage and display various shipment statuses
- Display complete shipment timeline from start to finish
- Display latest item location
- Display estimated delivery time

#### 14.2 Fleet Monitoring

- Track and display operational vehicle locations
- Display vehicle status (available, in task, maintenance)
- Monitor vehicle routes
- Alert for significant route deviations
- Monitor vehicle speed

#### 14.3 Operational Monitoring

- Monitor warehouse capacity and utilization
- Monitor item queues awaiting processing
- Monitor real-time operational performance (volume, processing time)
- Alert for operational process bottlenecks
- Real-time operational dashboard

#### 14.4 Notifications and Alerts

- Send notifications for shipment status changes
- Send alerts for shipping problems
- Send alerts for shipments approaching or exceeding SLA
- Send delivery confirmation notifications
- Support alert escalation to higher management levels if not addressed

## Non-Functional Requirements

### 1\. Performance Requirements

- System must respond to user requests within 3 seconds for 95% of transactions
- Web pages must load within 5 seconds on standard internet connections
- System must handle at least 100 transactions per second during peak hours
- System must support at least 500 concurrent active users
- Mobile applications must respond within 2 seconds for 95% of transactions
- Database queries must complete within 1 second for 95% of queries

### 2\. Security Requirements

- System must use secure authentication with password hashing and salt
- System must implement Role-Based Access Control (RBAC) to restrict access to functionality and data
- Sensitive data must be encrypted in storage and transmission using industry-standard encryption algorithms
- System must log all significant user activities in unalterable logs
- System must be protected against common attacks (SQL injection, XSS, CSRF, etc.)
- User sessions must automatically expire after a period of inactivity (30 minutes)
- System must enforce strong password policies and secure password reset processes
- APIs must be protected with authentication and rate limiting
- System must support encrypted backups and secure recovery procedures
- All user input must be validated to prevent injection attacks

### 3\. Reliability Requirements

- System must have uptime of at least 99.5% (excluding scheduled maintenance)
- Mean Time to Recovery (MTTR) must be less than 2 hours for critical incidents
- System must have automatic failover mechanisms for critical components
- System must perform automatic backups at least every 24 hours
- System must have a disaster recovery plan with RTO < 4 hours and RPO < 1 hour
- System must degrade gracefully during partial failures, with core functionality continuing to operate
- System must have proactive monitoring for early detection of potential issues
- System must maintain data consistency even in failure scenarios

### 4\. Compatibility Requirements

- Web application must be compatible with major browsers (Chrome, Firefox, Safari, Edge) in their latest version and 2 previous versions
- Mobile application must be compatible with Android 9.0+ and iOS 13.0+
- Web application must be responsive and usable on various screen sizes (desktop, tablet, mobile)
- System must support printing on standard printer types
- System must support export/import to standard formats (Excel, CSV, PDF)
- APIs must follow RESTful standards and support JSON format
- System must support data migration from legacy systems (if any)

### 5\. Scalability Requirements

- System must be able to scale horizontally by adding servers to handle increased load
- System must be able to scale vertically by increasing resources of existing servers
- System must support data volume growth of up to 100% per year without performance degradation
- System must support user growth of up to 50% per year without performance degradation
- System must support transaction volume growth of up to 100% per year without performance degradation
- Database must support sharding for scalability
- System must use load balancing to efficiently distribute load

### 6\. Usability Requirements

- User interface must be intuitive and easy to use for users with minimal technological skills
- User interface must be consistent across the system in terms of layout, navigation, and terminology
- Common tasks must be completable with minimal steps and input
- System must provide contextual help for complex functions
- System must prevent user errors through input validation and confirmation for risky actions
- System must display clear error messages and provide guidance for recovery
- Web application must meet WCAG 2.1 level AA accessibility standards
- System must support localization for at least Indonesian and English languages
- System must have comprehensive user documentation
- System must provide keyboard shortcuts for frequently used functions

### 7\. Maintainability Requirements

- System must be built with modular architecture for easy maintenance and development
- Key system parameters must be configurable without code changes
- System must be designed to facilitate automated testing
- Code must follow quality standards and best practices
- System must have comprehensive technical documentation
- System must use version control for code and documentation
- System must support Continuous Integration and Continuous Deployment
- System must have comprehensive logging for debugging
- System must be monitorable for performance and health
- APIs must be well-documented using standards like Swagger/OpenAPI

## User Interface Requirements

### Web Application UI

- Responsive design for various screen sizes
- Consistent navigation with sidebar
- Dashboard with widgets and charts
- Forms with validation
- Data tables with sorting, filtering, and pagination
- Modal dialogs for quick actions
- Notification panel
- Breadcrumbs for navigation
- Global search functionality

### Mobile Application UI

- Simple UI that doesn't distract field operators
- Offline-first approach with synchronization when connected
- Device feature integration (camera, GPS, notifications)
- Bandwidth-efficient for areas with limited connectivity
- Bottom navigation
- Task list
- Simple forms with validation
- Camera integration for documentation
- Barcode/QR scanner
- Digital signature pad
- Maps and navigation
- Notification center
- Offline indicator

## Hardware Requirements

- Thermal Printers: Width 80mm, resolution 203 dpi, print speed 150mm/s
- Barcode Scanners: Support for 1D and 2D codes, USB or Bluetooth connectivity
- Digital Scales: Capacity up to 100kg, accuracy 0.1kg, digital output
- Mobile Devices: Android 9.0+, RAM 3GB+, Camera 8MP+, GPS, 4G connectivity
- GPS Trackers: Accuracy 5-10m, update interval 1-5 minutes, 24-hour battery life

## External Interfaces

### Payment Gateway Interface

- Protocol: REST API over HTTPS
- Data Format: JSON
- Authentication: API Key + Secret
- Functionality: Payment processing, payment verification, refunds
- Potential Providers: Midtrans, Xendit, Doku

### Maps and Routing Service Interface

- Protocol: REST API over HTTPS
- Data Format: JSON
- Authentication: API Key
- Functionality: Geocoding, reverse geocoding, route planning, distance matrix
- Potential Providers: Google Maps API, Mapbox, HERE Maps

### SMS/Email Gateway Interface

- Protocol: REST API over HTTPS
- Data Format: JSON
- Authentication: API Key + Secret
- Functionality: SMS and email notification delivery
- Potential Providers: Twilio, SendGrid, Mailgun

### Forwarding Partner System Interface

- Protocol: REST API over HTTPS or File Exchange
- Data Format: JSON or XML
- Authentication: API Key or credentials
- Functionality: Rate requests, order creation, shipment tracking
- Integration: Custom per forwarding partner

## Data Requirements

- Data must be stored in a structured format to facilitate retrieval and analysis
- Critical data must be backed up at least daily
- Data retention policies must comply with legal and business requirements
- Data privacy must be maintained according to applicable regulations
- Data integrity must be ensured through validation and constraints
- Data must be migrated from legacy systems if applicable

## Constraints

- Development must be completed within 8 months
- Budget is limited to IDR 3,369,000,000
- System must operate with existing hardware infrastructure where possible
- Internet connectivity may be limited in some branch locations
- Staff technological skills vary significantly
- System must comply with Indonesian regulations including tax and data protection

## Glossary

| Term              | Definition                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- |
| STT               | Surat Tanda Terima, official document issued as proof of item receipt for shipping          |
| Pickup            | Process of collecting items from sender location                                            |
| Langsir           | Process of delivering items from warehouse to receiver address                              |
| Colly             | Unit of measure for item weight in shipping                                                 |
| Muat              | Process of loading items into transport vehicle                                             |
| DMB               | Daftar Muat Barang, document containing list of items loaded in one vehicle                 |
| KBH               | Kiriman Barang Harian, daily report on shipped items                                        |
| CASH              | Upfront payment method at time of shipping                                                  |
| COD               | Cash On Delivery, payment method at destination when item is received                       |
| CAD               | Cash After Delivery, payment method after item is received with specific terms (contra bon) |
| Debt Collector    | Staff assigned to collect CAD payments                                                      |
| Forwarder/Penerus | Logistics partner who forwards shipments to areas not covered by company branches           |
| RBAC              | Role-Based Access Control, access rights management system based on user roles              |
| ERP               | Enterprise Resource Planning, integrated system to manage all business processes            |
| Retur             | Return of items that cannot be delivered or are rejected by receiver                        |
