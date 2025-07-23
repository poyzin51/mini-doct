# Medical Appointment Management System

A full-stack medical appointment management system with a Spring Boot backend and React frontend.

## 📋 Prerequisites

### Backend Requirements
- **Java**: Version 17 or higher
- **Maven**: Version 3.6 or higher
- **MongoDB Atlas Account**: For database hosting

### Frontend Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher

## 🚀 Quick Start

### 1. Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd Backend
```

#### Step 2: MongoDB Atlas Credentials Setup
**IMPORTANT**: You need to set up MongoDB Atlas credentials before running the backend.

1. **Access Credentials**: Check your email for MongoDB Atlas credentials that were sent to you
2. **Update Configuration**: Open `src/main/resources/application.properties`
3. **Replace Credentials**: Update the MongoDB connection string with your actual credentials:

```properties
spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@medical-inter-cluster.o0mh0hm.mongodb.net/medical_inter?retryWrites=true&w=majority&appName=medical-inter-cluster
```

**Note**: Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with the credentials from your email.

#### Step 3: Run the Backend
```bash
# Clean and install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### Step 4: Verify Backend is Running
- **API Documentation**: Visit `http://localhost:8080/swagger-ui.html`
- **Health Check**: Visit `http://localhost:8080/actuator/health`

### 2. Frontend Setup

#### Step 1: Navigate to Frontend Directory
```bash
cd frontend-web
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Run the Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
medical-inter/
├── Backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/medicalinter/
│   │   │   │       ├── controller/     # REST Controllers
│   │   │   │       ├── service/        # Business Logic
│   │   │   │       ├── repository/     # Data Access
│   │   │   │       ├── model/          # Entity Classes
│   │   │   │       └── config/         # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
└── frontend-web/           # React Frontend
    ├── src/
    │   ├── components/     # React Components
    │   ├── pages/          # Page Components
    │   ├── services/       # API Services
    │   ├── contexts/       # React Contexts
    │   ├── hooks/          # Custom Hooks
    │   └── utils/          # Utility Functions
    ├── package.json
    └── vite.config.js
```

## 🔧 Configuration

### Backend Configuration
The main configuration file is `Backend/src/main/resources/application.properties`:

- **Server Port**: 8080
- **Database**: MongoDB Atlas
- **JWT Secret**: Configured for authentication
- **Swagger UI**: Available at `/swagger-ui.html`

### Frontend Configuration
- **Development Server**: Vite on port 5173
- **API Base URL**: Configured to connect to backend on port 8080
- **Styling**: Tailwind CSS

## 🛠️ Available Scripts

### Backend (Maven)
```bash
mvn clean install    # Clean and install dependencies
mvn spring-boot:run  # Run the application
mvn test            # Run tests
```

### Frontend (npm)
```bash
npm install         # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🔐 Authentication

The system supports two user types:
- **Patients**: Can book appointments and view their history
- **Professionals**: Can manage availability and view patient appointments

### Default Admin Credentials
- **Username**: admin
- **Password**: admin

## 📊 Features

### For Patients
- User registration and authentication
- Browse available professionals
- Book appointments
- View appointment history
- Cancel appointments

### For Professionals
- Manage availability time slots
- View and manage patient appointments
- Confirm, complete, or cancel appointments
- View appointment statistics

## 🗄️ Database

The application uses **MongoDB Atlas** as the cloud database. The connection string is configured in `application.properties`.

**Important**: Make sure to update the MongoDB credentials in the configuration file with the credentials sent to your email.

## 🚨 Troubleshooting

### Backend Issues
1. **MongoDB Connection Error**: Ensure credentials are correctly updated in `application.properties`
2. **Port Already in Use**: Change the port in `application.properties` or kill the process using port 8080
3. **Java Version**: Ensure you're using Java 17 or higher

### Frontend Issues
1. **Node Modules**: Run `npm install` if dependencies are missing
2. **Port Issues**: The dev server will automatically find an available port
3. **API Connection**: Ensure the backend is running on port 8080

## 📞 Support

If you encounter any issues:
1. Check that all prerequisites are installed
2. Verify MongoDB credentials are correctly configured
3. Ensure both backend and frontend are running
4. Check the console for error messages

## 🔄 Development Workflow

1. Start the backend first: `cd Backend && mvn spring-boot:run`
2. Start the frontend: `cd frontend-web && npm run dev`
3. Access the application at `http://localhost:5173`
4. Use the API documentation at `http://localhost:8080/swagger-ui.html` for testing endpoints

---

**Note**: Remember to check your email for the MongoDB Atlas credentials and update the `application.properties` file accordingly before running the backend. 