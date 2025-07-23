/**
 * Test utilities for the application
 */

// Mock data for testing
export const mockUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  userType: 'PROFESSIONAL',
  professionalId: 'test-professional-id',
};

export const mockProfessional = {
  id: 'test-professional-id',
  user: mockUser,
  specialization: 'Cardiology',
  licenseNumber: 'TEST123',
  score: 85,
  consultationFee: 150,
  availableTimeSlots: [
    '2024-01-15T09:00:00',
    '2024-01-15T10:00:00',
    '2024-01-15T11:00:00',
  ],
};

export const mockAppointment = {
  id: 'test-appointment-id',
  patient: {
    id: 'test-patient-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
  },
  professional: mockProfessional,
  appointmentDateTime: '2024-01-15T09:00:00',
  status: 'SCHEDULED',
  reason: 'Regular checkup',
  consultationFee: 150,
  createdAt: '2024-01-10T10:00:00',
};

// API mock responses
export const mockApiResponses = {
  login: {
    token: 'mock-jwt-token',
    type: 'Bearer',
    userId: mockUser.userId,
    email: mockUser.email,
    userType: mockUser.userType,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
  },
  
  appointments: [mockAppointment],
  
  professionals: [mockProfessional],
  
  timeSlots: mockProfessional.availableTimeSlots,
};

// Test helpers
export const createMockAuthContext = (overrides = {}) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  isInitialized: true,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateUser: jest.fn(),
  hasRole: jest.fn(() => true),
  isProfessional: jest.fn(() => true),
  getUserFullName: jest.fn(() => `${mockUser.firstName} ${mockUser.lastName}`),
  getUserInitials: jest.fn(() => 'TU'),
  ...overrides,
});

export const createMockApiCall = (response, delay = 0) => {
  return jest.fn(() => 
    new Promise((resolve) => 
      setTimeout(() => resolve(response), delay)
    )
  );
};

export const createMockApiError = (error, delay = 0) => {
  return jest.fn(() => 
    new Promise((_, reject) => 
      setTimeout(() => reject(error), delay)
    )
  );
};

// Form test helpers
export const fillForm = (container, formData) => {
  Object.keys(formData).forEach(fieldName => {
    const field = container.querySelector(`[name="${fieldName}"]`);
    if (field) {
      fireEvent.change(field, { target: { value: formData[fieldName] } });
    }
  });
};

export const submitForm = (container) => {
  const form = container.querySelector('form');
  if (form) {
    fireEvent.submit(form);
  }
};

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

// Custom render with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    authContextValue = createMockAuthContext(),
    routerProps = {},
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter {...routerProps}>
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test scenarios
export const testScenarios = {
  // Authentication scenarios
  loginSuccess: {
    description: 'User logs in successfully',
    mockApiCall: createMockApiCall(mockApiResponses.login),
    expectedOutcome: 'User is redirected to dashboard',
  },
  
  loginFailure: {
    description: 'User login fails with invalid credentials',
    mockApiCall: createMockApiError({ 
      type: 'API_ERROR', 
      message: 'Invalid credentials' 
    }),
    expectedOutcome: 'Error message is displayed',
  },
  
  // Appointment scenarios
  appointmentConfirmation: {
    description: 'Professional confirms an appointment',
    mockApiCall: createMockApiCall({
      ...mockAppointment,
      status: 'CONFIRMED',
    }),
    expectedOutcome: 'Appointment status updates to confirmed',
  },
  
  // Availability scenarios
  addTimeSlot: {
    description: 'Professional adds a new time slot',
    mockApiCall: createMockApiCall({
      ...mockProfessional,
      availableTimeSlots: [
        ...mockProfessional.availableTimeSlots,
        '2024-01-15T12:00:00',
      ],
    }),
    expectedOutcome: 'New time slot appears in the list',
  },
};

// Performance testing helpers
export const measureRenderTime = (componentName, renderFn) => {
  const startTime = performance.now();
  const result = renderFn();
  const endTime = performance.now();
  
  console.log(`${componentName} render time: ${endTime - startTime}ms`);
  return result;
};

// Accessibility testing helpers
export const checkAccessibility = async (container) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

export default {
  mockUser,
  mockProfessional,
  mockAppointment,
  mockApiResponses,
  createMockAuthContext,
  createMockApiCall,
  createMockApiError,
  renderWithProviders,
  testScenarios,
};