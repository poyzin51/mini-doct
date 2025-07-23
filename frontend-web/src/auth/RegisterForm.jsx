import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { professionalRegistrationSchema } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

/**
 * Professional registration form component
 */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register: registerUser, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(professionalRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      specialization: '',
      licenseNumber: '',
      description: '',
      address: '',
      consultationFee: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      
      // Convert consultationFee to number if provided
      const formData = {
        ...data,
        consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
      };
      
      const result = await registerUser(formData);
      
      if (result.success) {
        onSuccess?.(result.data);
      } else {
        // Handle specific field errors
        if (result.error && typeof result.error === 'object') {
          Object.keys(result.error).forEach(field => {
            setError(field, { message: result.error[field] });
          });
        } else {
          setSubmitError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Join as a Professional
        </h2>
        <p className="mt-2 text-gray-600">
          Create your professional account to start managing appointments
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-error-400 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-error-700">{submitError}</p>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              {...register('firstName')}
              error={errors.firstName?.message}
              placeholder="Enter your first name"
              autoComplete="given-name"
            />

            <Input
              label="Last Name"
              required
              {...register('lastName')}
              error={errors.lastName?.message}
              placeholder="Enter your last name"
              autoComplete="family-name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Email Address"
              type="email"
              required
              {...register('email')}
              error={errors.email?.message}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              required
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              placeholder="Enter your phone number"
              autoComplete="tel"
            />
          </div>

          <div className="mt-4">
            <Input
              label="Password"
              type="password"
              required
              {...register('password')}
              error={errors.password?.message}
              placeholder="Create a password (min. 6 characters)"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Specialization"
              required
              {...register('specialization')}
              error={errors.specialization?.message}
              placeholder="e.g., Cardiology, Dermatology"
            />

            <Input
              label="License Number"
              required
              {...register('licenseNumber')}
              error={errors.licenseNumber?.message}
              placeholder="Enter your medical license number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Consultation Fee (USD)"
              type="number"
              step="0.01"
              min="0"
              {...register('consultationFee')}
              error={errors.consultationFee?.message}
              placeholder="e.g., 150.00"
            />

            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
              placeholder="Your practice address"
            />
          </div>

          <div className="mt-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of your experience and expertise"
              />
              {errors.description && (
                <p className="text-sm text-error-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? 'Creating account...' : 'Create Professional Account'}
        </Button>

        {onSwitchToLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;