# Mchanga Fleet Management API Documentation

## Base URL
```
http://localhost:5000/api
```

## Health Check
```
GET /health
```
Returns the status of the backend server.

---

## Companies Endpoints

### List All Companies
```
GET /companies
```
Returns all companies in the system.

### Get Company by ID
```
GET /companies/:id
```
Returns a specific company by ID.

### Create Company
```
POST /companies
Content-Type: application/json

{
  "name": "ABC Transport",
  "registrationNumber": "REG123",
  "email": "info@abctransport.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Nairobi",
    "state": "Nairobi",
    "zipCode": "00100"
  }
}
```

### Update Company
```
PUT /companies/:id
Content-Type: application/json
```
Same body as Create Company.

### Delete Company
```
DELETE /companies/:id
```

---

## Vehicles Endpoints

### List All Vehicles
```
GET /vehicles
```

### Get Vehicle by ID
```
GET /vehicles/:id
```

### Create Vehicle
```
POST /vehicles
Content-Type: application/json

{
  "registrationNumber": "KBZ123A",
  "make": "Toyota",
  "model": "Hiace",
  "year": 2022,
  "licensePlate": "KBZ123A",
  "status": "active",
  "company": "company_id"
}
```

### Update Vehicle
```
PUT /vehicles/:id
```

### Delete Vehicle
```
DELETE /vehicles/:id
```

### Update Vehicle Location
```
PATCH /vehicles/:id/location
Content-Type: application/json

{
  "latitude": -1.2921,
  "longitude": 36.8219
}
```

---

## Customers Endpoints

### List All Customers
```
GET /customers
```

### Get Customer by ID
```
GET /customers/:id
```

### Create Customer
```
POST /customers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Nairobi",
    "state": "Nairobi",
    "zipCode": "00200"
  }
}
```

### Update Customer
```
PUT /customers/:id
```

### Delete Customer
```
DELETE /customers/:id
```

### Get Customer Statistics
```
GET /customers/:id/stats
```

---

## Trips Endpoints

### List All Trips
```
GET /trips
```

### Get Trip by ID
```
GET /trips/:id
```

### Create Trip
```
POST /trips
Content-Type: application/json

{
  "tripNumber": "TRIP001",
  "vehicle": "vehicle_id",
  "customer": "customer_id",
  "startTime": "2024-01-15T08:00:00Z",
  "endTime": "2024-01-15T10:00:00Z",
  "fare": 500,
  "status": "completed"
}
```

### Update Trip
```
PUT /trips/:id
```

### Delete Trip
```
DELETE /trips/:id
```

### Get Trips by Customer
```
GET /trips/customer/:customerId
```

### Get Trips by Vehicle
```
GET /trips/vehicle/:vehicleId
```

---

## Payments Endpoints

### List All Payments
```
GET /payments
```

### Get Payment by ID
```
GET /payments/:id
```

### Create Payment
```
POST /payments
Content-Type: application/json

{
  "paymentNumber": "PAY001",
  "customer": "customer_id",
  "trip": "trip_id",
  "amount": 500,
  "paymentMethod": "cash",
  "status": "completed"
}
```

### Update Payment
```
PUT /payments/:id
```

### Delete Payment
```
DELETE /payments/:id
```

### Get Payments by Customer
```
GET /payments/customer/:customerId
```

### Get Payment Statistics
```
GET /payments/stats/summary
```

---

## Services Endpoints

### List All Services
```
GET /services
```

### Get Service by ID
```
GET /services/:id
```

### Create Service
```
POST /services
Content-Type: application/json

{
  "vehicle": "vehicle_id",
  "serviceType": "maintenance",
  "cost": 2000,
  "serviceDate": "2024-01-20",
  "description": "Regular maintenance",
  "status": "scheduled"
}
```

### Update Service
```
PUT /services/:id
```

### Delete Service
```
DELETE /services/:id
```

### Get Services by Vehicle
```
GET /services/vehicle/:vehicleId
```

### Get Scheduled Services
```
GET /services/status/scheduled
```

---

## Fuel Endpoints

### List All Fuel Records
```
GET /fuel
```

### Get Fuel Record by ID
```
GET /fuel/:id
```

### Create Fuel Record
```
POST /fuel
Content-Type: application/json

{
  "vehicle": "vehicle_id",
  "fuelType": "diesel",
  "quantityAdded": 50,
  "cost": 5000,
  "fuelDate": "2024-01-15"
}
```

### Update Fuel Record
```
PUT /fuel/:id
```

### Delete Fuel Record
```
DELETE /fuel/:id
```

### Get Fuel Records by Vehicle
```
GET /fuel/vehicle/:vehicleId
```

### Get Fuel Consumption Statistics
```
GET /fuel/stats/consumption
```

---

## Emergencies Endpoints

### List All Emergencies
```
GET /emergencies
```

### Get Emergency by ID
```
GET /emergencies/:id
```

### Create Emergency
```
POST /emergencies
Content-Type: application/json

{
  "vehicle": "vehicle_id",
  "trip": "trip_id",
  "emergencyType": "accident",
  "description": "Minor collision",
  "severity": "medium",
  "status": "reported"
}
```

### Update Emergency
```
PUT /emergencies/:id
```

### Delete Emergency
```
DELETE /emergencies/:id
```

### Get Emergencies by Vehicle
```
GET /emergencies/vehicle/:vehicleId
```

### Get Active Emergencies
```
GET /emergencies/status/active
```

### Get Critical Emergencies
```
GET /emergencies/severity/critical
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message",
  "details": ["Additional details if available"]
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mchanga
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

---

## Testing with cURL

### Create a Company
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "registrationNumber": "REG001",
    "email": "test@company.com",
    "phone": "+1234567890"
  }'
```

### Get All Vehicles
```bash
curl http://localhost:5000/api/vehicles
```

### Update Vehicle Location
```bash
curl -X PATCH http://localhost:5000/api/vehicles/vehicle_id/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -1.2921,
    "longitude": 36.8219
  }'
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This should be added in production.

## Authentication

Currently, there is no authentication implemented. JWT authentication should be added in production.

## CORS

CORS is enabled for all origins. This should be restricted in production.

