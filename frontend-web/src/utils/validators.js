import * as yup from 'yup';
import { VALIDATION_MESSAGES } from './constants';

// Common validation schemas
export const emailSchema = yup
  .string()
  .email(VALIDATION_MESSAGES.EMAIL_INVALID)
  .required(VALIDATION_MESSAGES.REQUIRED);

export const passwordSchema = yup
  .string()
  .min(6, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
  .required(VALIDATION_MESSAGES.REQUIRED);

export const nameSchema = yup
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .required(VALIDATION_MESSAGES.REQUIRED);

export const phoneSchema = yup
  .string()
  .matches(/^[\+]?[1-9][\d]{0,15}$/, VALIDATION_MESSAGES.PHONE_INVALID)
  .required(VALIDATION_MESSAGES.REQUIRED);

// Login form validation schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

// Professional registration form validation schema
export const professionalRegistrationSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneSchema,
  specialization: yup
    .string()
    .trim()
    .required(VALIDATION_MESSAGES.SPECIALIZATION_REQUIRED),
  licenseNumber: yup
    .string()
    .trim()
    .required(VALIDATION_MESSAGES.LICENSE_REQUIRED),
  description: yup
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters'),
  address: yup
    .string()
    .trim()
    .max(200, 'Address must be less than 200 characters'),
  consultationFee: yup
    .number()
    .positive('Consultation fee must be positive')
    .max(10000, 'Consultation fee seems too high')
    .typeError(VALIDATION_MESSAGES.CONSULTATION_FEE_INVALID),
});

// Time slot form validation schema
export const timeSlotSchema = yup.object({
  date: yup
    .date()
    .min(new Date(), 'Date must be in the future')
    .required(VALIDATION_MESSAGES.REQUIRED),
  startTime: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .required(VALIDATION_MESSAGES.REQUIRED),
  endTime: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = value.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return endMinutes > startMinutes;
    }),
});

// Appointment update validation schema
export const appointmentUpdateSchema = yup.object({
  appointmentDateTime: yup
    .date()
    .min(new Date(), 'Appointment must be in the future')
    .required(VALIDATION_MESSAGES.REQUIRED),
  reason: yup
    .string()
    .trim()
    .max(200, 'Reason must be less than 200 characters'),
});

// Professional profile update validation schema
export const professionalProfileSchema = yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: phoneSchema,
  specialization: yup
    .string()
    .trim()
    .required(VALIDATION_MESSAGES.SPECIALIZATION_REQUIRED),
  description: yup
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters'),
  address: yup
    .string()
    .trim()
    .max(200, 'Address must be less than 200 characters'),
  consultationFee: yup
    .number()
    .positive('Consultation fee must be positive')
    .max(10000, 'Consultation fee seems too high')
    .typeError(VALIDATION_MESSAGES.CONSULTATION_FEE_INVALID),
});

// Utility functions for validation
export const validateEmail = (email) => {
  try {
    emailSchema.validateSync(email);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validatePassword = (password) => {
  try {
    passwordSchema.validateSync(password);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validatePhoneNumber = (phone) => {
  try {
    phoneSchema.validateSync(phone);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};