import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import { authStart, authSuccess, authFailure } from '../store/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const res = await axiosInstance.post('/auth/register', data);
      if (res.data.success) {
        dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
        toast.success(`Account created successfully! Welcome, ${res.data.user.name}`);
        navigate('/');
      }
    } catch (err) {
      dispatch(authFailure(err.message));
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card p-8 sm:p-10 relative z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Create Account</h2>
          <p className="text-sm text-neutral font-light">Join Atelier to explore premium luxury fashion.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/45">
                <FiUser />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.name ? 'border-red-400' : 'border-primary/10'
                }`}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/45">
                <FiMail />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.email ? 'border-red-400' : 'border-primary/10'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/45">
                <FiPhone />
              </span>
              <input
                type="text"
                placeholder="9876543210"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Invalid phone number (must be 10 digits)',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.phone ? 'border-red-400' : 'border-primary/10'
                }`}
              />
            </div>
            {errors.phone && (
              <span className="text-xs text-red-500 font-medium">{errors.phone.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/45">
                <FiLock />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.password ? 'border-red-400' : 'border-primary/10'
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-primary/5 pt-6">
          <p className="text-xs text-neutral font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
