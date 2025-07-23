# Mini Docto+ Professional Web Interface

A React-based web application for healthcare professionals to manage their practice, appointments, and availability. This application connects to the Mini Docto+ Spring Boot backend.

## 🚀 Features

### Authentication
- Professional login and registration
- JWT-based authentication with automatic token management
- Secure session handling with auto-logout on token expiration

### Dashboard
- Professional score display (0-100 rating)
- Today's appointments overview
- Quick statistics and metrics
- Professional profile summary

### Appointment Management
- View all appointments with filtering and search
- Appointment status management (confirm, complete, cancel)
- Today's appointments view
- Appointment statistics and analytics

### Availability Management
- Calendar view for managing time slots
- Add single or recurring time slots
- Bulk time slot operations
- Availability statistics

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Toast notifications for user feedback
- Loading states and error handling
- Clean, professional interface

## 🛠️ Technology Stack

- **React 18+** - Frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Hook Form + Yup** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **React Calendar** - Calendar component for availability
- **Date-fns** - Date manipulation utilities

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Mini Docto+ Backend running on `http://localhost:8080`

## ⚙️ Installation & Setup

1. **Install dependencies:**
   ```bash
   cd frontend-web
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the frontend-web directory:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
frontend-web/
├── public/                 # Static assets
├── src/
│   ├── api/               # API layer and HTTP client
│   │   ├── axios.js       # Axios configuration
│   │   ├── auth.js        # Authentication API
│   │   ├── appointments.js # Appointments API
│   │   └── availability.js # Availability API
│   ├── auth/              # Authentication components
│   │   ├── AuthLayout.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Basic UI components
│   │   ├── layout/       # Layout components
│   │   └── common/       # Common components
│   ├── features/         # Feature-specific components
│   │   ├── appointments/ # Appointment management
│   │   └── availability/ # Availability management
│   ├── pages/            # Route-level pages
│   │   ├── DashboardPage.jsx
│   │   ├── AppointmentsPage.jsx
│   │   ├── AvailabilityPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── routes/           # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── utils/            # Utility functions
│   │   ├── constants.js
│   │   ├── dateUtils.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── hooks/            # Custom React hooks
│   ├── App.jsx           # Main app component
│   └── main.jsx          # App entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Authentication Flow

1. **Registration:** Healthcare professionals register with their credentials and professional information
2. **Login:** Users authenticate with email/password
3. **Token Management:** JWT tokens are stored securely and automatically included in API requests
4. **Auto-logout:** Users are automatically logged out when tokens expire
5. **Route Protection:** Protected routes redirect unauthenticated users to login

## 📱 Pages & Features

### Dashboard (`/dashboard`)
- Welcome message with professional name
- Professional score display
- Today's appointments overview
- Quick statistics cards
- Professional profile summary
- Quick action buttons

### Appointments (`/appointments`)
- Complete appointments list with filtering
- Search by patient name, email, or reason
- Filter by status and date range
- Appointment actions (confirm, complete, cancel)
- Appointment statistics

### Availability (`/availability`)
- Calendar view of available time slots
- Add single or recurring time slots
- List view with bulk operations
- Availability statistics
- Time slot management

## 🎨 UI Components

### Basic Components
- `Button` - Configurable button with variants and loading states
- `Input` - Form input with validation error display
- `Card` - Content container with header/content sections
- `Loader` - Loading spinner with different sizes
- `EmptyState` - Empty state with actions

### Feature Components
- `AppointmentCard` - Individual appointment display
- `AppointmentsList` - Appointments list with filtering
- `TimeSlotForm` - Add time slots form
- `AvailabilityCalendar` - Calendar interface

## 🔧 Configuration

### API Configuration
The application connects to the backend API at `http://localhost:8080` by default. This can be configured via the `VITE_API_URL` environment variable.

### Styling
Tailwind CSS is configured with custom color schemes:
- Primary: Blue tones
- Success: Green tones
- Warning: Yellow/Orange tones
- Error: Red tones

## 🚀 Build & Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Deploy:**
   The `dist/` folder contains the built application ready for deployment to any static hosting service.

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript-style JSDoc comments
- Maintain consistent file naming (PascalCase for components)

## 🔗 API Integration

The application integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register/professional` - Professional registration

### Appointments
- `GET /api/appointments/professional/{id}` - Get professional's appointments
- `PUT /api/appointments/{id}/confirm` - Confirm appointment
- `PUT /api/appointments/{id}/complete` - Complete appointment
- `PUT /api/appointments/{id}/cancel` - Cancel appointment

### Availability
- `GET /api/professionals/{id}` - Get professional data with time slots
- `POST /api/professionals/{id}/time-slots` - Add time slot
- `DELETE /api/professionals/{id}/time-slots` - Remove time slot

## 🐛 Error Handling

- Global error boundary catches React errors
- API errors are handled with user-friendly messages
- Network errors show retry options
- Form validation with real-time feedback
- Toast notifications for success/error states

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT token secure storage
- Automatic token expiration handling
- Protected routes with authentication checks
- Input validation and sanitization
- CORS handling for API requests

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Add proper JSDoc comments for new functions
3. Ensure responsive design for new components
4. Test authentication flows thoroughly
5. Handle loading and error states appropriately

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify the backend is running on `http://localhost:8080`
3. Ensure all environment variables are set correctly
4. Check network connectivity to the backend API