# AutoSathi API Documentation

## Overview

AutoSathi REST API for vehicle maintenance management. This API provides endpoints for user authentication, vehicle management, fuel tracking, service records, and document management.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors (if any)
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "password": "Password123",
  "phone": "+919876543210"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "Password123"
}
```

#### Get Profile
```http
GET /auth/profile
```

#### Update Profile
```http
PUT /auth/profile
```

#### Change Password
```http
PUT /auth/change-password
```

### Vehicles

#### Get All Vehicles
```http
GET /vehicles?page=1&limit=10
```

#### Get Vehicle by ID
```http
GET /vehicles/:id
```

#### Create Vehicle
```http
POST /vehicles
```

**Request Body:**
```json
{
  "make": "Maruti Suzuki",
  "model": "Swift",
  "year": 2020,
  "vehicleType": "car",
  "fuelType": "petrol",
  "registrationNumber": "MH01AB1234",
  "chassisNumber": "MA3ELA56S7C890123",
  "engineNumber": "G12B567890",
  "purchaseDate": "2020-01-15",
  "purchaseOdometer": 0,
  "currentOdometer": 45000
}
```

#### Update Vehicle
```http
PUT /vehicles/:id
```

#### Update Odometer
```http
PATCH /vehicles/:id/odometer
```

#### Delete Vehicle
```http
DELETE /vehicles/:id
```

#### Get Vehicle Statistics
```http
GET /vehicles/stats
```

#### Get Upcoming Renewals
```http
GET /vehicles/renewals?days=30
```

### Fuel Entries

#### Get Fuel Entries by Vehicle
```http
GET /fuel/vehicle/:vehicleId?page=1&limit=50
```

#### Get Fuel Entry by ID
```http
GET /fuel/:id
```

#### Create Fuel Entry
```http
POST /fuel
```

**Request Body:**
```json
{
  "vehicleId": "vehicle-uuid",
  "fuelDate": "2024-01-15",
  "odometerReading": 45000,
  "fuelQuantity": 35.50,
  "fuelPricePerLiter": 105.50,
  "totalCost": 3745.25,
  "fuelStation": "HP Petrol Pump",
  "fuelType": "petrol"
}
```

#### Update Fuel Entry
```http
PUT /fuel/:id
```

#### Delete Fuel Entry
```http
DELETE /fuel/:id
```

#### Get Monthly Statistics
```http
GET /fuel/vehicle/:vehicleId/stats/monthly?months=12
```

#### Get Average Mileage
```http
GET /fuel/vehicle/:vehicleId/stats/mileage
```

#### Get Total Expense
```http
GET /fuel/vehicle/:vehicleId/stats/expense?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Recent Entries
```http
GET /fuel/recent?limit=10
```

### Dashboard

#### Get Overview
```http
GET /dashboard/overview
```

#### Get Mileage Statistics
```http
GET /dashboard/mileage-stats
```

#### Get Expense Trends
```http
GET /dashboard/expense-trends?months=12
```

#### Get Service Reminders
```http
GET /dashboard/service-reminders
```

#### Get Vehicle Health
```http
GET /dashboard/vehicle-health
```

### Insurance (Placeholder)

#### Get All Insurance Policies
```http
GET /insurance
```

#### Get Insurance by ID
```http
GET /insurance/:id
```

#### Create Insurance Policy
```http
POST /insurance
```

#### Update Insurance Policy
```http
PUT /insurance/:id
```

#### Delete Insurance Policy
```http
DELETE /insurance/:id
```

### PUC (Placeholder)

#### Get All PUC Certificates
```http
GET /puc
```

#### Get PUC by ID
```http
GET /puc/:id
```

#### Create PUC Certificate
```http
POST /puc
```

#### Update PUC Certificate
```http
PUT /puc/:id
```

#### Delete PUC Certificate
```http
DELETE /puc/:id
```

### Services (Placeholder)

#### Get All Service Records
```http
GET /services
```

#### Get Service Record by ID
```http
GET /services/:id
```

#### Create Service Record
```http
POST /services
```

#### Update Service Record
```http
PUT /services/:id
```

#### Delete Service Record
```http
DELETE /services/:id
```

### Documents (Placeholder)

#### Get All Documents
```http
GET /documents
```

#### Get Document by ID
```http
GET /documents/:id
```

#### Upload Document
```http
POST /documents
```

#### Delete Document
```http
DELETE /documents/:id
```

### Notifications (Placeholder)

#### Get All Notifications
```http
GET /notifications
```

#### Mark Notification as Read
```http
PUT /notifications/:id/read
```

#### Delete Notification
```http
DELETE /notifications/:id
```

## Error Codes

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate entry)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15-minute window per IP address.

## Data Validation

All endpoints validate input data and return detailed error messages for validation failures.

## Pagination

List endpoints support pagination using `page` and `limit` query parameters.

## Filtering

Some endpoints support filtering via query parameters (e.g., date ranges, vehicle IDs).

## Cron Jobs

The system includes automated daily checks for:
- Insurance expiry reminders
- PUC certificate expiry reminders
- Service due reminders

Reminders are created 30 days before expiry dates (configurable).
