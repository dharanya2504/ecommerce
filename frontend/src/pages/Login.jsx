import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import { authStart, authSuccess, authFailure } from '../store/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const res = await axiosInstance.post('/auth/login', data);
      if (res.data.success) {
        dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        
        // Sync Cart on Login
        try {
          const cartRes = await axiosInstance.get('/cart');
          if (cartRes.data.success) {
            const { cartSuccess } = require('../store/cartSlice');
            dispatch(cartSuccess(cartRes.data));
          }
        } catch (cErr) {
          console.warn('Failed to sync cart on login:', cErr.message);
        }

        navigate(from, { replace: true });
      }
    } catch (err) {
      dispatch(authFailure(err.message));
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card p-8 sm:p-10 relative z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-sm text-neutral font-light">Enter your credentials to access your Atelier account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-1.5">
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
                className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.email ? 'border-red-400' : 'border-primary/10'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-primary">
                Password
              </label>
              <a href="#" className="text-xs text-primary hover:underline font-light">
                Forgot password?
              </a>
            </div>
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
                className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
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
            className="w-full py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            {!loading && <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-primary/5 pt-6">
          <p className="text-xs text-neutral font-light">
            New to Atelier?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
