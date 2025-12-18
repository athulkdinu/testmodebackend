# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient" // optional, defaults to "patient"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "jwt_token_here"
}
```

---

## Dashboard Endpoints

### Patient Dashboard
```http
GET /api/dashboard/patient
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalAppointments": 10,
  "upcomingAppointments": [...],
  "notifications": [...],
  "unreadCount": 3
}
```

### Doctor Dashboard
```http
GET /api/dashboard/doctor
Authorization: Bearer <token>
```

**Response:**
```json
{
  "appointmentsToday": 5,
  "pendingAppointments": 3,
  "totalPatients": 20,
  "appointmentsPerDay": [
    { "date": "2024-01-01", "count": 2 },
    ...
  ]
}
```

### Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalDoctors": 10,
  "totalPatients": 100,
  "appointmentsToday": 25,
  "appointmentsPerWeek": [...]
}
```

---

## Profile Endpoints

### Get Profile
```http
GET /api/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "contact": "contact@example.com",
  "password": "newpassword" // optional
}
```

### Update Doctor Profile
```http
PUT /api/profile/doctor
Authorization: Bearer <token>
Content-Type: application/json

{
  "specialty": "Cardiology",
  "experience": 10,
  "contact": "doctor@example.com",
  "schedule": [
    {
      "day": "Monday",
      "slots": ["09:00 AM", "10:00 AM"]
    }
  ]
}
```

---

## Appointment Endpoints

### Get Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```
Returns appointments filtered by user role (patient sees their appointments, doctor sees their appointments)

### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor_id_or_doctor_user_id",
  "date": "2024-01-15",
  "time": "10:00 AM",
  "type": "in-person", // or "video"
  "reason": "Regular checkup"
}
```

### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-16",
  "time": "11:00 AM",
  "status": "approved" // pending, approved, rejected, completed, cancelled
}
```

### Approve Appointment
```http
PUT /api/appointments/:id/approve
Authorization: Bearer <token>
```
Doctor only

### Reject Appointment
```http
PUT /api/appointments/:id/reject
Authorization: Bearer <token>
```
Doctor only

---

## Medicine Endpoints

### Get Medicines
```http
GET /api/medicines
Authorization: Bearer <token>
```

### Add Medicine
```http
POST /api/medicines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Aspirin",
  "dosage": "100mg",
  "time": "08:00 AM",
  "frequency": "daily",
  "notes": "Take with food"
}
```

### Update Medicine
```http
PUT /api/medicines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Aspirin",
  "dosage": "200mg",
  "time": "09:00 AM"
}
```

### Delete Medicine
```http
DELETE /api/medicines/:id
Authorization: Bearer <token>
```

---

## Health Records Endpoints

### Get Records
```http
GET /api/records
Authorization: Bearer <token>
```

### Upload Record
```http
POST /api/records
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
filename: "Lab Report"
date: "2024-01-01"
category: "lab-report"
notes: "Annual checkup"
```

### Update Record
```http
PUT /api/records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "Updated Name",
  "category": "imaging"
}
```

### Delete Record
```http
DELETE /api/records/:id
Authorization: Bearer <token>
```

### Download Record
```http
GET /api/records/:id/download
Authorization: Bearer <token>
```

### Get Patient Records (Doctor)
```http
GET /api/records/patient/:patientId
Authorization: Bearer <token>
```
Doctor only

---

## Health Insights Endpoints

### Get Health Insights
```http
GET /api/health-insights?type=bmi
Authorization: Bearer <token>
```

### Add Health Insight
```http
POST /api/health-insights
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "bmi", // bmi, blood_pressure, weight, height
  "value": 22.5,
  "additionalData": {
    "weight": 70,
    "height": 175
  },
  "date": "2024-01-01",
  "notes": "Regular checkup"
}
```

For blood pressure:
```json
{
  "type": "blood_pressure",
  "value": 120,
  "additionalData": {
    "systolic": 120,
    "diastolic": 80
  },
  "date": "2024-01-01"
}
```

### Get BMI Tracker
```http
GET /api/health-insights/bmi
Authorization: Bearer <token>
```

### Get Blood Pressure Trends
```http
GET /api/health-insights/blood-pressure
Authorization: Bearer <token>
```

### Get Appointment Stats
```http
GET /api/health-insights/appointment-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 10,
  "pending": 2,
  "approved": 5,
  "completed": 3,
  "rejected": 0,
  "monthlyStats": [...]
}
```

---

## Notification Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

## Doctor Endpoints

### Get All Doctors
```http
GET /api/doctors
```
Public endpoint

### Add Doctor (Admin)
```http
POST /api/doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "password": "password123",
  "specialty": "Cardiology",
  "experience": 10,
  "contact": "contact@example.com"
}
```

### Update Doctor (Admin)
```http
PUT /api/doctors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dr. Smith",
  "specialty": "Neurology",
  "experience": 15
}
```

### Delete Doctor (Admin)
```http
DELETE /api/doctors/:id
Authorization: Bearer <token>
```

---

## Doctor Notes Endpoints

### Get Doctor Notes
```http
GET /api/doctor_notes
Authorization: Bearer <token>
```
Returns notes filtered by role (patient sees their notes, doctor sees their notes)

### Add Doctor Note
```http
POST /api/doctor_notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_user_id",
  "note": "Patient shows improvement",
  "diagnosis": "Common cold",
  "prescription": "Rest and fluids"
}
```
Doctor only

### Update Doctor Note
```http
PUT /api/doctor_notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Updated notes",
  "diagnosis": "Updated diagnosis"
}
```
Doctor only

### Get Patient Notes (Doctor)
```http
GET /api/doctor_notes/patient/:patientId
Authorization: Bearer <token>
```
Doctor only

---

## User Management Endpoints (Admin)

### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```
Admin only

### Add User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "patient"
}
```
Admin only

### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```
Admin only

---

## Analytics Endpoints (Admin)

### Get System Analytics
```http
GET /api/analytics
Authorization: Bearer <token>
```
Admin only

**Response:**
```json
{
  "doctorsCount": 10,
  "patientsCount": 100,
  "appointmentsPerWeek": [...],
  "appointmentsByStatus": {
    "pending": 5,
    "approved": 20,
    "rejected": 2,
    "completed": 50,
    "cancelled": 3
  },
  "appointmentsPerDay": [...],
  "topDoctors": [...]
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error message here"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Notes

1. All dates should be in `YYYY-MM-DD` format
2. Times should be in `HH:mm` or `HH:mm AM/PM` format
3. File uploads are limited to 10MB
4. Supported file types: jpeg, jpg, png, pdf, doc, docx, xls, xlsx
5. Appointment statuses: `pending`, `approved`, `rejected`, `completed`, `cancelled`
6. User roles: `patient`, `doctor`, `admin`
7. Health insight types: `bmi`, `blood_pressure`, `weight`, `height`

