# App Flow Document

## Overview

#

This document outlines the key user flows and interactions within the Samudra Paket ERP system. It details the step-by-step processes for both web and mobile applications, illustrating how users navigate through the system to accomplish specific tasks. These flows are designed to be efficient, intuitive, and aligned with the business processes of PT. Sarana Mudah Raya.

## User Types and Roles

#

The system accommodates various user types with different roles and permissions:

1.  Management Users

- Direktur Utama/Owner (Super User)
- Manager Keuangan (Finance Manager)
- Manager Administrasi (Administration Manager)
- Manager Operasional (Operations Manager)
- Manager HRD (HR Manager)
- Manager Marketing (Marketing Manager)

3.  Branch Operations Users

- Kepala Cabang (Branch Head)
- Kepala Gudang (Warehouse Head)
- Kepala Administrasi (Administration Head)

5.  Operational Staff

- Checker
- Team Muat/Lansir (Loading/Delivery Team)
- Supir (Driver) - Pickup, Lansir, Truk Antar Cabang
- Kenek (Helper)

7.  Administrative Staff

- Staff Penjualan (Sales Staff)
- Staff Administrasi (Administration Staff)
- Staff Lansir (Delivery Staff)
- Kasir (Cashier)
- Debt Collector
- Customer Service

## Web Application Flows

### 1\. Authentication Flow

#

Purpose: Enable users to securely log into the system

Users: All users

Flow Steps:

1.  Access Login Page

- User navigates to the login page
- System displays login form

3.  Enter Credentials

- User enters username/email and password
- User clicks "Login" button

5.  Credential Validation

- System validates credentials
- If invalid, display error message
- If valid, proceed to next step

7.  Multi-Factor Authentication (for sensitive roles)

- System sends verification code to user's registered device
- User enters verification code
- System validates the code

9.  Session Creation

- System creates user session
- System records login activity
- System redirects to appropriate dashboard based on user role

11. Password Recovery (Alternative Flow)  


- User clicks "Forgot Password" link
- User enters email address
- System sends password reset instructions
- User follows link in email
- User creates new password
- System confirms password reset

### 2\. Dashboard Navigation Flow

#

Purpose: Provide users with an overview of key metrics and quick access to functions

Users: All users

Flow Steps:

1.  Dashboard Loading

- System displays appropriate dashboard based on user role
- System loads relevant KPIs and metrics
- System shows recent activities/notifications

3.  Navigation Options

- User can access main navigation menu (sidebar/header)
- User can view notifications
- User can access quick action buttons
- User can view and interact with dashboard widgets

5.  Widget Interaction

- User can filter dashboard data by date range/branch/other parameters
- User can drill down into widget details
- User can export dashboard data

7.  Navigation to Modules

- User clicks on module link in navigation menu
- System navigates to selected module
- System maintains consistent navigation structure across modules

### 3\. Pickup Request Flow

#

Purpose: Create and process pickup requests from customers

Users: Customer Service, Kepala Gudang, Staff Administrasi

Flow Steps:

1.  Create Pickup Request

- User navigates to Pickup Management module
- User clicks "New Pickup Request"
- System displays pickup request form

3.  Enter Customer Information

- User searches for existing customer or enters new customer details
- System validates customer information
- User enters pickup address and contact details

5.  Enter Shipment Details

- User enters package details (type, quantity, estimated weight, dimensions)
- User selects pickup date and time window
- User adds any special instructions

7.  Validate Service Area

- System validates if pickup address is within service area
- If outside service area, system notifies user
- User can override with approval or refer to forwarding partner

9.  Submit Request

- User submits pickup request
- System generates pickup request ID
- System notifies relevant staff

11. Assign Pickup Team  


- Kepala Gudang views pending pickup requests
- Kepala Gudang assigns driver and helper
- System optimizes route for multiple pickups
- System notifies assigned team

13. Track Pickup Status  


- User can view current status of pickup requests
- Status updates automatically based on mobile app inputs
- User can view estimated pickup completion time

### 4\. Waybill Creation Flow

#

Purpose: Create waybill/STT for shipments

Users: Staff Penjualan

Flow Steps:

1.  Access Waybill Creation

- User navigates to Waybill/STT module
- User clicks "Create New Waybill"
- System displays waybill form

3.  Enter Sender Information

- User selects customer from database or enters new customer
- System populates customer information if existing
- User verifies or updates sender details

5.  Enter Receiver Information

- User enters receiver details (name, address, contact information)
- System validates address format
- System checks if address is within service area

7.  Enter Package Details

- User enters package details (description, quantity, weight, dimensions)
- System calculates volumetric weight if applicable
- User can add multiple items if needed

9.  Calculate Shipping Cost

- System automatically calculates shipping cost based on weight, distance, and service type
- User can apply special rates or discounts if authorized
- System displays breakdown of costs

11. Select Payment Method  


- User selects payment method (CASH, COD, CAD)
- If CASH, system prompts for payment collection
- If CAD, system sets payment terms and due date

13. Generate Waybill  


- User reviews all information
- User clicks "Generate Waybill"
- System creates waybill with unique number
- System prints waybill/STT (6 copies with different colors)

15. Process Payment (if applicable)  


- If CASH payment, user collects payment
- User enters payment details
- System generates receipt

### 5\. Shipment Loading Flow

#

Purpose: Process and load shipments onto vehicles for transport

Users: Kepala Gudang, Checker, Team Muat

Flow Steps:

1.  Access Loading Module

- User navigates to Loading Management
- System displays pending shipments for loading

3.  Select Destination Branch

- User filters shipments by destination branch
- System groups shipments by destination

5.  Select Vehicle

- User selects available vehicle
- System displays vehicle capacity and current load

7.  Allocate Shipments

- User selects shipments to load
- System validates total weight against vehicle capacity
- System calculates load efficiency

9.  Generate Loading Form

- User clicks "Generate Loading Form"
- System creates loading form with unique ID
- System lists all shipments to be loaded

11. Assign Loading Team  


- User assigns loading team members
- System notifies assigned team members

13. Confirm Loading  


- Checker physically verifies each shipment
- Checker scans or enters waybill numbers
- System updates status of each shipment

15. Complete Loading Process  


- User confirms loading complete
- System updates shipment statuses to "Loaded"
- System generates manifest for driver

17. Dispatch Vehicle  


- Kepala Gudang reviews and approves dispatch
- System records departure time
- System updates vehicle and shipment statuses

### 6\. Inter-Branch Shipment Flow

#

Purpose: Manage shipments between branches

Users: Kepala Gudang, Supir Truk Antar Cabang

Flow Steps:

1.  Prepare Shipment

- Loading completed as per Loading Flow
- Kepala Gudang reviews manifest

3.  Generate Transport Documents

- System generates Daftar Muat Barang (DMB)
- System generates Laporan Kiriman per Truk
- User prints documents

5.  Prepare Driver

- User assigns driver and helper
- User processes transportation costs
- System records driver details and departure time

7.  Track Journey

- Driver updates status via mobile app at key points
- System tracks location via GPS
- System estimates arrival time
- Destination branch can view incoming shipments

9.  Receive at Destination

- Destination branch Kepala Gudang receives truck
- Staff verifies shipments against manifest
- Staff notes any discrepancies
- System updates shipment statuses

11. Unload Shipments  


- Team unloads shipments
- Checker verifies each item
- System updates inventory at destination branch

13. Complete Transfer  


- Kepala Gudang confirms receipt
- System finalizes transfer
- System generates receipt confirmation
- System updates vehicle status for return trip

### 7\. Delivery Management Flow

#

Purpose: Manage last-mile delivery to recipients

Users: Staff Lansir, Kepala Gudang, Supir Lansir

Flow Steps:

1.  Access Delivery Module

- User navigates to Delivery Management
- System displays shipments ready for delivery

3.  Group Deliveries by Area

- User filters shipments by delivery area
- System suggests optimal grouping

5.  Assign Delivery Vehicle

- User selects appropriate vehicle
- System validates vehicle capacity

7.  Optimize Delivery Route

- System generates optimized delivery route
- User can adjust route if necessary

9.  Create Delivery Order

- User creates delivery order
- System generates unique delivery order ID
- System creates list of shipments to deliver

11. Assign Delivery Team  


- User assigns driver and helper
- System notifies assigned team

13. Prepare Shipments  


- Warehouse staff prepares shipments for delivery
- Checker verifies each shipment
- System updates status to "Out for Delivery"

15. Process Deliveries  


- Driver delivers packages using mobile app
- System updates delivery status in real-time
- Driver collects COD payments if applicable
- Driver obtains signature for proof of delivery

17. Complete Delivery Process  


- Driver returns to branch
- User reconciles deliveries and payments
- System updates all shipment statuses
- System generates delivery completion report

### 8\. Return Management Flow

#

Purpose: Process returned shipments

Users: Staff Lansir, Kepala Gudang, Checker

Flow Steps:

1.  Initiate Return

- Driver reports delivery failure via mobile app
- Driver selects return reason from predefined list
- Driver adds photos or notes if necessary
- System creates return request

3.  Return Approval

- Kepala Gudang reviews return request
- Kepala Gudang approves or rejects return
- System updates shipment status

5.  Process Return

- Shipment is returned to branch
- Checker inspects returned shipment
- Checker updates system with condition details
- System assigns warehouse location for storage

7.  Notify Sender

- System generates sender notification
- User contacts sender about return
- User records sender's instructions

9.  Return Resolution

- User selects resolution (redeliver, return to sender, dispose)
- If redelivery, system creates new delivery order
- If return to sender, system creates return shipment
- System updates shipment status accordingly

11. Complete Return Process  


- User finalizes return process
- System updates inventory
- System generates return report
- System closes return case

### 9\. Billing and Collection Flow

#

Purpose: Manage billing for CAD shipments and collect payments

Users: Staff Administrasi, Kasir, Debt Collector

Flow Steps:

1.  Access Billing Module

- User navigates to Billing Management
- System displays CAD shipments

3.  Generate Invoices

- User selects shipments for billing
- User groups invoices by customer if needed
- System generates invoices with payment terms
- User sends invoices to customers

5.  Track Receivables

- System tracks invoice due dates
- System categorizes receivables by age
- System generates aging reports
- System sends payment reminders

7.  Plan Collections

- User views overdue invoices
- User creates collection schedule
- System optimizes collection routes
- User assigns debt collectors

9.  Process Collections

- Debt collector visits customers
- Debt collector records collection results
- System updates receivables status
- System generates collection reports

11. Record Payments  


- Kasir receives payments
- Kasir records payment details
- System updates invoice status
- System generates payment receipts

13. Reconcile Accounts  


- User reconciles collections with invoices
- System updates customer payment history
- System generates reconciliation reports
- System closes paid invoices

### 10\. Financial Reporting Flow

#

Purpose: Generate financial reports for management

Users: Kasir, Kepala Administrasi, Manager Keuangan, Direktur Utama

Flow Steps:

1.  Access Reporting Module

- User navigates to Financial Reporting
- System displays available report types

3.  Select Report Type

- User selects report type (revenue, expenses, P&L, etc.)
- System displays report parameters

5.  Set Report Parameters

- User selects time period (daily, weekly, monthly, custom)
- User selects branch or all branches
- User sets additional filters if needed

7.  Generate Report

- User clicks "Generate Report"
- System processes data
- System displays report with visualizations
- System shows key metrics and trends

9.  Interact with Report

- User can drill down into specific data points
- User can toggle between different views
- User can filter results further

11. Export/Share Report  


- User selects export format (PDF, Excel, etc.)
- System generates export file
- User can email report directly from system
- System logs report access

13. Schedule Regular Reports  


- User can set up scheduled reports
- User defines recipients and frequency
- System automatically generates and distributes reports
- System maintains report history

## Mobile Application Flows

### 1\. Mobile Authentication Flow

#

Purpose: Enable field staff to securely access the mobile app

Users: All mobile app users (Checkers, Drivers, Debt Collectors)

Flow Steps:

1.  Launch App

- User opens mobile application
- System checks for existing valid session
- If session exists, go to home screen
- If no session, display login screen

3.  Enter Credentials

- User enters username and password
- User can enable "Remember Me" option
- User taps "Login" button

5.  Validate Credentials

- System validates credentials
- If offline, validate against cached credentials
- If online, validate against server

7.  Biometric Authentication (Optional)

- User can set up fingerprint/face ID for future logins
- System stores biometric authentication token
- User can use biometric login for subsequent sessions

9.  Sync User Data

- System downloads necessary data for offline operation
- System synchronizes pending offline actions
- System updates local database

11. Access Home Screen  


- System displays appropriate home screen based on user role
- System shows pending tasks and notifications
- User can access role-specific functions

### 2\. Checker App Flow - Item Verification

#

Purpose: Verify received items and record details

Users: Checker

Flow Steps:

1.  Access Verification Screen

- User navigates to Item Verification
- System displays pending items for verification

3.  Scan Waybill

- User scans waybill barcode using camera
- System retrieves shipment details
- System displays item information

5.  Verify Item Details

- User checks item description, quantity, and condition
- User records any discrepancies
- User takes photos of items if needed

7.  Measure and Weigh

- User connects to digital scale via Bluetooth if available
- User enters item dimensions and weight
- System calculates volumetric weight
- System flags if actual weight differs from declared weight

9.  Update System

- User confirms verification complete
- System updates item status
- If offline, system queues update for synchronization
- If online, system updates in real-time

11. Allocate to Location/Vehicle  


- User assigns item to warehouse location or vehicle
- System records allocation
- System generates location tag if needed

13. Complete Verification  


- User completes verification process
- System generates verification report
- System notifies relevant staff

### 3\. Driver App Flow - Pickup Execution

#

Purpose: Execute pickup requests and collect items

Users: Pickup Drivers

Flow Steps:

1.  View Assigned Pickups

- User logs into driver app
- System displays assigned pickup tasks for the day
- System shows optimized route

3.  Start Pickup Journey

- User selects pickup task
- User taps "Start Journey"
- System records start time and location
- System provides navigation to pickup location

5.  Arrive at Location

- User arrives at pickup location
- User taps "Arrived at Location"
- System records arrival time and location
- System updates pickup status

7.  Verify Items

- User meets customer
- User verifies items against pickup request
- User records any discrepancies
- User takes photos of items

9.  Complete Pickup Form

- User fills digital pickup form
- User enters actual weight and dimensions if available
- User notes any special handling requirements
- Customer signs on device screen

11. Confirm Pickup Completion  


- User taps "Complete Pickup"
- System records completion time
- System updates pickup status
- System synchronizes data when online

13. Return to Branch  


- System provides navigation back to branch
- User confirms arrival at branch
- System notifies checker about incoming items

### 4\. Driver App Flow - Delivery Execution

#

Purpose: Execute deliveries to recipients

Users: Delivery Drivers

Flow Steps:

1.  View Delivery Tasks

- User logs into driver app
- System displays assigned deliveries
- System shows optimized route
- System displays total stops and estimated completion time

3.  Start Delivery Route

- User taps "Start Route"
- System records start time and location
- System provides navigation to first delivery location

5.  Arrive at Delivery Location

- User arrives at delivery location
- User taps "Arrived at Location"
- System records arrival time and location
- System displays delivery details

7.  Contact Recipient

- User contacts recipient if needed
- User records contact attempt
- System provides recipient contact information

9.  Deliver Package

- User locates recipient
- User verifies recipient identity
- User delivers package
- User collects COD payment if applicable

11. Capture Proof of Delivery  


- Recipient signs on device screen
- User takes photo of delivered package if needed
- User records any delivery notes
- System records proof of delivery

13. Complete Delivery  


- User taps "Complete Delivery"
- System records completion time
- System updates delivery status
- System provides navigation to next delivery

15. Handle Delivery Issues  


- If delivery cannot be completed, user selects reason
- User records attempted delivery details
- User takes photo of location if needed
- System creates return request if necessary

17. Complete Delivery Route  


- After final delivery, user taps "Complete Route"
- System summarizes completed deliveries
- System records return to branch
- System synchronizes all delivery data

### 5\. Debt Collector App Flow - Collection

#

Purpose: Collect payments from customers with CAD shipments

Users: Debt Collectors

Flow Steps:

1.  View Collection Tasks

- User logs into debt collector app
- System displays assigned collections for the day
- System shows optimized route
- System displays total amount to collect

3.  Start Collection Route

- User taps "Start Collections"
- System records start time and location
- System provides navigation to first collection location

5.  Arrive at Customer Location

- User arrives at customer location
- User taps "Arrived at Location"
- System displays customer details and outstanding invoices
- System shows payment history and notes

7.  Interact with Customer

- User meets customer
- User presents outstanding invoices
- User negotiates payment if needed
- User records customer feedback

9.  Process Payment

- User selects payment method (cash, transfer, check)
- User enters payment amount
- If partial payment, user records reason and next follow-up date
- If payment declined, user records reason and action plan

11. Generate Receipt  


- System generates digital receipt
- Customer signs on device screen
- User can email or print receipt if needed
- System records transaction

13. Complete Collection Visit  


- User taps "Complete Visit"
- System records completion time
- System updates invoice status
- System provides navigation to next collection

15. End Collection Route  


- After final collection, user taps "End Route"
- System summarizes collections
- System calculates total collected amount
- System prepares reconciliation report

17. Reconcile Collections  


- Upon return to office, user reconciles collected payments
- User hands over cash to cashier
- System updates all payment statuses
- System closes completed collections

### 6\. Warehouse App Flow - Inventory Management

#

Purpose: Manage warehouse inventory and operations

Users: Warehouse Staff, Kepala Gudang

Flow Steps:

1.  Access Inventory Screen

- User logs into warehouse app
- System displays current inventory status
- System shows pending tasks (receiving, loading, etc.)

3.  Receive Shipments

- User selects "Receive Shipments"
- User scans incoming shipments
- System verifies against expected shipments
- System updates inventory

5.  Allocate Storage Locations

- User assigns storage locations to items
- System records item locations
- System optimizes storage based on item characteristics
- System generates location labels if needed

7.  Process Outgoing Shipments

- User selects "Outgoing Shipments"
- System displays shipments scheduled for dispatch
- User retrieves items from storage locations
- User stages items for loading

9.  Manage Returns

- User processes returned items
- User inspects and records item condition
- User determines appropriate action
- System updates inventory accordingly

11. Conduct Inventory Counts  


- User initiates inventory count
- User scans items in specified zones
- System compares actual vs. recorded inventory
- System flags discrepancies
- User resolves inventory issues

13. Generate Reports  


- User selects report type
- System generates inventory reports
- User reviews space utilization, item turnover, etc.
- User can share reports with management

## Flow Diagrams

### Authentication Flow Diagram

#

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐

│  Access     │     │   Enter     │     │  Validate   │     │   Create    │

│  Login Page ├────>│ Credentials ├────>│ Credentials ├────>│   Session   │

└─────────────┘     └─────────────┘     └──────┬──────┘     └─────────────┘

                                               │

                                               │

                                        ┌──────▼──────┐

                                        │  Invalid    │

                                        │ Credentials │

                                        └──────┬──────┘

                                               │

                                        ┌──────▼──────┐

                                        │ Display     │

                                        │ Error Msg   │

                                        └─────────────┘

### Pickup Request Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  Create       │     │  Enter        │     │  Enter        │

│  Pickup Req   ├────>│  Customer     ├────>│  Shipment     │

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Validate     │

                                           │  Service Area │

                                           └───────┬───────┘

                                                   │

                          ┌───────────────┐     ┌─▼─────────────┐

                          │  Assign       │     │  Submit       │

                          │  Pickup Team  │<────┤  Request      │

                          └───────┬───────┘     └───────────────┘

                                  │

                          ┌───────▼───────┐

                          │  Track        │

                          │  Pickup Status│

                          └───────────────┘

### Waybill Creation Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  Access       │     │  Enter        │     │  Enter        │

│  Waybill Mod  ├────>│  Sender Info  ├────>│  Receiver Info│

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Enter        │

                                           │  Package Info │

                                           └───────┬───────┘

                                                   │

┌───────────────┐     ┌───────────────┐     ┌─────▼─────────┐

│  Process      │     │  Generate     │     │  Select       │

│  Payment      │<────┤  Waybill      │<────┤  Payment Type │

└───────────────┘     └───────────────┘     └───────────────┘

### Shipment Loading Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  Access       │     │  Select       │     │  Select       │

│  Loading Mod  ├────>│  Destination  ├────>│  Vehicle      │

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Allocate     │

                                           │  Shipments    │

                                           └───────┬───────┘

                                                   │

┌───────────────┐     ┌───────────────┐     ┌─────▼─────────┐

│  Confirm      │     │  Assign       │     │  Generate     │

│  Loading      │<────┤  Loading Team │<────┤  Loading Form │

└───────┬───────┘     └───────────────┘     └───────────────┘

        │

┌───────▼───────┐

│  Dispatch     │

│  Vehicle      │

└───────────────┘

### Mobile Authentication Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  Launch       │     │  Enter        │     │  Validate     │

│  App          ├────>│  Credentials  ├────>│  Credentials  │

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Sync         │

                                           │  User Data    │

                                           └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Access       │

                                           │  Home Screen  │

                                           └───────────────┘

### Driver App - Pickup Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  View         │     │  Start        │     │  Arrive at    │

│  Assigned     ├────>│  Journey      ├────>│  Location     │

│  Pickups      │     │               │     │               │

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Verify       │

                                           │  Items        │

                                           └───────┬───────┘

                                                   │

┌───────────────┐     ┌───────────────┐     ┌─────▼─────────┐

│  Return to    │     │  Confirm      │     │  Complete     │

│  Branch       │<────┤  Pickup       │<────┤  Pickup Form  │

└───────────────┘     └───────────────┘     └───────────────┘

### Driver App - Delivery Flow Diagram

#

┌───────────────┐     ┌───────────────┐     ┌───────────────┐

│  View         │     │  Start        │     │  Arrive at    │

│  Delivery     ├────>│  Route        ├────>│  Location     │

│  Tasks        │     │               │     │               │

└───────────────┘     └───────────────┘     └───────┬───────┘

                                                   │

                                           ┌───────▼───────┐

                                           │  Contact      │

                                           │  Recipient    │

                                           └───────┬───────┘

                                                   │

┌───────────────┐     ┌───────────────┐     ┌─────▼─────────┐

│  Complete     │     │  Capture      │     │  Deliver      │

│  Delivery     │<────┤  Proof of     │<────┤  Package      │

│               │     │  Delivery     │     │               │

└───────┬───────┘     └───────────────┘     └───────────────┘

        │

┌───────▼───────┐

│  Complete     │

│  Route        │

└───────────────┘

## Key User Journeys

### Journey 1: Pickup to Delivery Process

#

This journey illustrates the complete lifecycle of a shipment from pickup request to final delivery.

1.  Customer Service creates a pickup request based on customer call
2.  Kepala Gudang assigns pickup team
3.  Driver executes pickup using mobile app and brings items to branch
4.  Checker verifies and processes items
5.  Staff Penjualan creates waybill and calculates costs
6.  Checker allocates shipment to vehicle for inter-branch transport
7.  Supir Antar Cabang transports shipment to destination branch
8.  Destination Checker receives and processes shipment
9.  Staff Lansir assigns shipment for final delivery
10. Supir Lansir delivers package to recipient

11. Recipient receives package and signs proof of delivery

12. Staff Administrasi updates system and completes shipment record

### Journey 2: CAD Payment Collection Process

#

This journey illustrates the process of managing and collecting Cash After Delivery payments.

1.  Staff Penjualan creates waybill with CAD payment method
2.  Shipment goes through normal processing and delivery
3.  Recipient receives package without immediate payment
4.  System records receivable with due date
5.  Staff Administrasi generates invoice for customer
6.  System sends payment reminders as due date approaches
7.  Staff Administrasi assigns collection to Debt Collector
8.  Debt Collector visits customer to collect payment
9.  Customer makes payment
10. Debt Collector records payment in mobile app

11. Kasir reconciles collected funds

12. System updates receivable status to paid

### Journey 3: Branch Performance Monitoring

#

This journey illustrates how management monitors branch performance.

1.  Manager logs into system
2.  System displays executive dashboard with KPIs
3.  Manager filters data by specific branch
4.  Manager reviews operational metrics (volume, on-time rate, etc.)
5.  Manager reviews financial metrics (revenue, costs, profitability)
6.  Manager drills down into specific metrics of concern
7.  Manager compares branch performance against targets
8.  Manager generates detailed reports for further analysis
9.  Manager shares insights with branch management
10. Branch management takes action based on insights

## State Transitions

### Shipment Status Transitions

#

\[Created\] --> \[Picked Up\] --> \[Processed\] --> \[Loaded\] --> \[In Transit\]

                                                              |

                                                              v

\[Closed\] <-- \[Delivered\] <-- \[Out for Delivery\] <-- \[Arrived at Branch\]

Alternative flows:

\[Out for Delivery\] --> \[Delivery Failed\] --> \[Scheduled for Redelivery\] --> \[Out for Delivery\]

                                |

                                v

                        \[Returned to Branch\] --> \[Return Process Initiated\]

### Payment Status Transitions

#

\[Created\] --> \[Pending\] --> \[Partial\] --> \[Paid\] --> \[Reconciled\]

                                |

                                v

                        \[Overdue\] --> \[In Collection\] --> \[Paid\]

                                            |

                                            v

                                    \[Disputed\] --> \[Resolved\] --> \[Paid\]

## Mobile-Specific Considerations

### Offline Functionality

#

The mobile applications are designed to work in offline mode with the following capabilities:

1.  Data Caching

- Essential data stored locally
- User can view assigned tasks without connectivity
- Pre-downloaded customer information and routes

3.  Operation Queuing

- Actions performed offline are queued
- System maintains transaction integrity
- Actions executed in correct order when online

5.  Conflict Resolution

- System detects and resolves conflicts
- User alerted to manual resolution needs
- Data prioritization based on timestamps

7.  Synchronization

- Automatic sync when connection restored
- Manual sync option available
- Sync status indicators
- Partial sync capabilities for low bandwidth

### Location Services

#

Mobile apps leverage device location capabilities:

1.  GPS Tracking

- Periodic location updates
- Geofencing for automated status updates
- Route recording for compliance and analysis

3.  Map Integration

- Turn-by-turn navigation
- Address verification
- Location-based alerts
- Coverage area visualization

5.  Offline Maps

- Pre-downloaded map data for operational areas
- Basic navigation without connectivity
- Address search in offline mode

### Camera Integration

#

Mobile apps utilize device cameras for various functions:

1.  Document Scanning

- Waybill/STT scanning
- Document digitization
- OCR for quick data entry

3.  Package Documentation

- Item condition photos
- Delivery confirmation photos
- Location verification photos

5.  Proof of Delivery

- Signature capture
- ID verification
- Delivery situation documentation

## Error Handling and Recovery

### Common Error Scenarios and Resolutions

#

1.  Network Connectivity Loss

- System switches to offline mode
- User can continue with cached data
- System queues operations for later sync
- Automatic retry when connection restored

3.  Device Failure

- Session data backed up to server periodically
- User can resume session on another device
- Critical operations require confirmation before processing
- Automatic logs for troubleshooting

5.  User Error

- Validation prevents most common errors
- Confirmation required for critical actions
- Ability to revert recent actions
- Help resources available within the application

7.  Server-Side Issues

- Graceful degradation to limited functionality
- Clear error messages with estimated resolution time
- Automatic retry with exponential backoff
- Alternative workflows for critical operations

### Recovery Procedures

#

1.  Data Synchronization Conflicts

- System identifies conflicts with timestamps
- Automated resolution for non-critical conflicts
- User prompted for manual resolution when needed
- Audit trail of resolution decisions

3.  Interrupted Operations

- Operations are atomic where possible
- Transaction logs allow for resumption
- Checkpoint system for multi-step processes
- System can rollback to last stable state

5.  Authentication Failures

- Alternate authentication methods
- Temporary access codes for emergency cases
- Escalation procedure for authentication issues
- Limited offline authentication capabilities

## Conclusion

#

This App Flow Document provides a comprehensive overview of the key user flows within the Samudra Paket ERP system. By following these structured flows, the system will deliver a consistent, efficient, and intuitive user experience that aligns with the business processes of PT. Sarana Mudah Raya.

The document serves as a guide for both development and testing teams to ensure that the implemented system accurately reflects the intended user journeys and supports the operational requirements of the business. Regular updates to this document will be made as the system evolves and new requirements are identified.
