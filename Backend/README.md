# Mini Docto+ - Medical Appointment System

A comprehensive medical appointment management system built with Spring Boot and MongoDB. This system connects patients with healthcare professionals, featuring appointment booking, professional ranking, and complete user management.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.2.1 with Java 17
- **Database**: MongoDB
- **Security**: JWT Authentication
- **Frontend**: React (Web for Professionals), Flutter (Mobile for Patients)

## 🚀 Features

### 🔐 Authentication
- Dual user types: Patients and Professionals
- JWT-based authentication
- Secure password encryption with BCrypt

### 👤 Patient Features
- View available professionals ranked by score
- Search professionals by specialization
- Book appointments with available time slots
- View, modify, and cancel personal appointments
- View upcoming appointments

### 👨‍⚕️ Professional Features
- Manage availability time slots
- View booked appointments
- Confirm/complete appointments
- Profile management

### 🏆 Professional Ranking System
- Score-based ranking (0-100)
- Professionals sorted by score (highest first)
- Search within specializations with ranking

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Java 17** or higher installed
2. **Maven 3.6+** installed
3. **MongoDB** running locally on port 27017

## ⚙️ Setup Instructions

### 1. MongoDB Setup

**Option A: Install MongoDB locally**
```bash
# Download and install MongoDB from https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod
```

**Option B: Use MongoDB Docker container**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Configure Application

The application is pre-configured to connect to MongoDB on `localhost:27017` with database name `medical_inter`. 

If you need to change the configuration, edit `src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=medical_inter

# JWT Configuration
jwt.secret=mySecretKey123456789012345678901234567890
jwt.expiration=86400000
```

### 3. Run the Application

```bash
# Clean and compile
mvn clean compile

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

### Authentication Endpoints

#### Register Patient
```bash
POST /api/auth/register/patient
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Register Professional
```bash
POST /api/auth/register/professional
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123",
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "description": "Experienced cardiologist",
  "address": "123 Medical St",
  "consultationFee": 150.0
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Professional Endpoints

#### Get Professionals Ranked by Score (Core Feature)
```bash
GET /api/professionals/ranked
```

#### Search Professionals by Specialization with Ranking (Core Feature)
```bash
GET /api/professionals/search?specialization=cardiology
```

#### Get Professionals with Available Slots
```bash
GET /api/professionals/available
```

#### Add Time Slot (Professional Only)
```bash
POST /api/professionals/{id}/time-slots
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "timeSlot": "2024-01-15T09:00:00"
}
```

#### Remove Time Slot (Professional Only)
```bash
DELETE /api/professionals/{id}/time-slots
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "timeSlot": "2024-01-15T09:00:00"
}
```

### Appointment Endpoints

#### Book Appointment (Patient Only)
```bash
POST /api/appointments/book
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "patientId": "patient-id",
  "professionalId": "professional-id",
  "appointmentDateTime": "2024-01-15T09:00:00",
  "timeSlot": "2024-01-15T09:00:00",
  "reason": "Regular checkup"
}
```

#### Get Patient Appointments
```bash
GET /api/appointments/patient/{patientId}
Authorization: Bearer {jwt-token}
```

#### Get Professional Appointments
```bash
GET /api/appointments/professional/{professionalId}
Authorization: Bearer {jwt-token}
```

#### Cancel Appointment
```bash
PUT /api/appointments/{appointmentId}/cancel
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "userId": "user-id"
}
```

#### Confirm Appointment (Professional Only)
```bash
PUT /api/appointments/{appointmentId}/confirm
Authorization: Bearer {jwt-token}
```

## 🧪 Testing the Application

### 1. Register Users
```bash
# Register a patient
curl -X POST http://localhost:8080/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890"
  }'

# Register a professional
curl -X POST http://localhost:8080/api/auth/register/professional \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123",
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "specialization": "Cardiology",
    "licenseNumber": "MD123456",
    "consultationFee": 150.0
  }'
```

### 2. Test Professional Ranking
```bash
# Get all professionals ranked by score
curl http://localhost:8080/api/professionals/ranked

# Search by specialization with ranking
curl "http://localhost:8080/api/professionals/search?specialization=cardiology"
```

### 3. Test Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }'
```

## 🗂️ Project Structure

```
src/main/java/com/example/medicalinter/
├── config/
│   ├── SecurityConfig.java      # Spring Security configuration
│   └── JwtUtils.java           # JWT token utilities
├── controller/
│   ├── AuthController.java     # Authentication endpoints
│   ├── ProfessionalController.java # Professional management
│   └── AppointmentController.java  # Appointment management
├── model/
│   ├── User.java              # Base user entity
│   ├── UserType.java          # User type enum
│   ├── Professional.java      # Professional entity
│   ├── Appointment.java       # Appointment entity
│   └── AppointmentStatus.java # Appointment status enum
├── repository/
│   ├── UserRepository.java    # User data access
│   ├── ProfessionalRepository.java # Professional data access
│   └── AppointmentRepository.java  # Appointment data access
├── service/
│   ├── UserService.java       # User business logic
│   ├── ProfessionalService.java # Professional business logic
│   └── AppointmentService.java    # Appointment business logic
└── MedicalInterApplication.java   # Main application class
```

## 🔧 Configuration

### MongoDB Collections
The application creates the following collections:
- `users` - Patient and professional user accounts
- `professionals` - Professional profiles with scores
- `appointments` - Appointment bookings

### Security Configuration
- JWT tokens expire in 24 hours (configurable)
- Passwords are encrypted using BCrypt
- CORS enabled for cross-origin requests

## 🚨 Important Notes

1. **MongoDB Database**: Make sure MongoDB is running before starting the application
2. **JWT Secret**: Change the JWT secret in production
3. **CORS**: Configure CORS origins for production use
4. **Professional Scores**: Default professional score is 0.0, can be updated via API
5. **Time Slots**: Professionals must add available time slots before patients can book

## 🤝 Integration with Frontend

### React Web App (Professionals)
- Use JWT authentication
- Implement professional dashboard
- Manage appointments and time slots

### Flutter Mobile App (Patients)  
- Use JWT authentication
- Display professionals ranked by score
- Implement appointment booking flow

## 📝 Development Notes

- The application uses Spring Boot 3.2.1 with Jakarta EE
- MongoDB integration with Spring Data
- Comprehensive error handling and validation
- Professional ranking system as core feature
- RESTful API design with proper HTTP status codes

## 🔄 Next Steps

1. Set up MongoDB database
2. Test the API endpoints
3. Integrate with React web app for professionals
4. Integrate with Flutter mobile app for patients
5. Add additional features like reviews, ratings, and notifications 