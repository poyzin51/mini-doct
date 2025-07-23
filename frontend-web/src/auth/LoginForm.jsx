import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

/**
 * Login form component
 */
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      
      const result = await login(data);
      
      if (result.success) {
        onSuccess?.(result.data);
      } else {
        // Handle specific field errors
        if (result.error && typeof result.error === 'object') {
          Object.keys(result.error).forEach(field => {
            setError(field, { message: result.error[field] });
          });
        } else {
          setSubmitError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-gray-600">
          Sign in to your professional account
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

        <Input
          label="Email address"
          type="email"
          required
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter your email"
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          required
          {...register('password')}
          error={errors.password?.message}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-500"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password
                alert('Forgot password functionality not implemented yet');
              }}
            >
              Forgot your password?
            </a>
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
          {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        {onSwitchToRegister && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;