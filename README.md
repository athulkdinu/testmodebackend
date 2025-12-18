# Smart Health System - Backend API

Complete backend API for the Smart Health System with support for Patients, Doctors, and Admin roles.

## Features

### Patient Features
- ✅ Dashboard with total appointments, upcoming appointments, and notifications
- ✅ Book appointments with status tracking (pending/approved/rejected)
- ✅ Appointment history with status filtering
- ✅ Medicine tracker (add, update, delete medicines with reminders)
- ✅ Health records (upload/download files)
- ✅ Health insights (BMI tracker, blood pressure trends, appointment stats)
- ✅ Profile management (update contact details)

### Doctor Features
- ✅ Dashboard with appointments today, pending approvals, total patients, and charts
- ✅ Appointment management (view, approve, reject appointments)
- ✅ Patient record access
- ✅ Add/Update diagnosis notes for patients
- ✅ Doctor profile management

### Admin Features
- ✅ Dashboard with summary cards and analytics
- ✅ Manage doctors (add, edit, delete)
- ✅ Manage users (view patient list, delete users)
- ✅ System reports with analytics charts

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- bcrypt for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
MONGO_URL=mongodb://localhost:27017/smart-health-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000

# Agora Video Calling Configuration
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

**To get your Agora App Certificate:**
1. Go to [Agora Console](https://console.agora.io/)
2. Select your project (or create a new one)
3. Navigate to **Project Management** > **Config** tab
4. Copy the **App Certificate** (Primary Certificate)
5. Add it to your `.env` file as `AGORA_APP_CERTIFICATE`

**Note:** The App Certificate is required for token generation. Without it, video calls will fail with authentication errors.

3. Start MongoDB (make sure MongoDB is running)

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Dashboard
- `GET /api/dashboard/patient` - Get patient dashboard data
- `GET /api/dashboard/doctor` - Get doctor dashboard data
- `GET /api/dashboard/admin` - Get admin dashboard data

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/doctor` - Update doctor profile (doctor only)

### Appointments
- `GET /api/appointments` - Get appointments (filtered by role)
- `POST /api/appointments` - Book appointment (patient)
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/approve` - Approve appointment (doctor)
- `PUT /api/appointments/:id/reject` - Reject appointment (doctor)

### Medicines
- `GET /api/medicines` - Get medicines (patient)
- `POST /api/medicines` - Add medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Health Records
- `GET /api/records` - Get health records (patient)
- `POST /api/records` - Upload health record (with file)
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record
- `GET /api/records/:id/download` - Download record file
- `GET /api/records/patient/:patientId` - Get patient records (doctor)

### Health Insights
- `GET /api/health-insights` - Get health insights
- `POST /api/health-insights` - Add health insight
- `GET /api/health-insights/bmi` - Get BMI tracker data
- `GET /api/health-insights/blood-pressure` - Get blood pressure trends
- `GET /api/health-insights/appointment-stats` - Get appointment statistics

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Doctors
- `GET /api/doctors` - Get all doctors (public)
- `POST /api/doctors` - Add doctor (admin)
- `PUT /api/doctors/:id` - Update doctor (admin)
- `DELETE /api/doctors/:id` - Delete doctor (admin)

### Doctor Notes
- `GET /api/doctor_notes` - Get doctor notes
- `POST /api/doctor_notes` - Add doctor note (doctor)
- `PUT /api/doctor_notes/:id` - Update doctor note (doctor)
- `GET /api/doctor_notes/patient/:patientId` - Get patient notes (doctor)

### Users (Admin)
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/users` - Add user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)

### Analytics (Admin)
- `GET /api/analytics` - Get system analytics

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## File Uploads

Health records can be uploaded using multipart/form-data. Supported file types:
- Images: jpeg, jpg, png
- Documents: pdf, doc, docx, xls, xlsx
- Max file size: 10MB

Files are stored in the `backend/uploads` directory.

## Default Admin Account

On first run, an admin account is automatically created:
- Email: `admin@gmail.com`
- Password: `admin123`

**Change these credentials in production!**

## Database Models

- **User**: User accounts (patient, doctor, admin)
- **Doctor**: Doctor-specific information
- **Appointment**: Appointment bookings
- **Medicine**: Medicine tracker entries
- **Record**: Health record files
- **HealthInsight**: BMI, blood pressure, and other health metrics
- **Notification**: User notifications
- **DoctorNote**: Doctor diagnosis and notes

## Error Handling

All errors are returned in JSON format:
```json
{
  "message": "Error message here"
}
```

## Development

The server runs on port 3000 by default. Use `npm run dev` for development with auto-reload.

## Notes

- All timestamps are stored in ISO format
- Dates are stored as strings in YYYY-MM-DD format
- File uploads are stored locally (consider cloud storage for production)

