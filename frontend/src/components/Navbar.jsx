import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiGrid } from 'react-icons/fi';
import { logout } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';

const Navbar = ({ onCartOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, isAdmin } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Men', path: '/shop?category=Men%27s%20Clothing' },
    { name: 'Women', path: '/shop?category=Women%27s%20Clothing' },
    { name: 'Accessories', path: '/shop?category=Accessories' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'py-3 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-premium'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-2xl text-primary hover:text-secondary transition-colors"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-widest text-primary flex items-center gap-1 hover:opacity-85 transition-opacity"
          >
            ATELIER
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative text-sm tracking-wider font-medium text-text hover:text-primary transition-colors py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Utilities (Cart, Auth) */}
          <div className="flex items-center gap-6">
            {/* User Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-text hover:text-primary transition-colors focus:outline-none"
                    aria-label="User account"
                  >
                    <span className="hidden md:inline text-xs tracking-wider font-semibold">
                      HI, {user?.name?.split(' ')[0].toUpperCase()}
                    </span>
                    <FiUser className="text-xl" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        {/* Overlay to close menu */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        ></div>

                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute right-0 mt-3 w-48 bg-white border border-primary/10 rounded-xl shadow-premium-hover p-2 z-50 origin-top-right"
                        >
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-background hover:text-primary rounded-lg transition-colors"
                          >
                            <FiUser className="text-base" />
                            My Dashboard
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-background hover:text-primary rounded-lg transition-colors"
                            >
                              <FiGrid className="text-base" />
                              Admin Panel
                            </Link>
                          )}
                          <hr className="my-1 border-background" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
                          >
                            <FiLogOut className="text-base" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-text hover:text-primary transition-colors"
                  aria-label="Login"
                >
                  <FiUser className="text-xl" />
                </Link>
              )}
            </div>

            {/* Shopping Cart Icon */}
            <button
              onClick={onCartOpen}
              className="relative p-1 text-text hover:text-primary transition-colors focus:outline-none"
              aria-label="Open cart"
            >
              <FiShoppingBag className="text-xl" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-premium"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Mobile Drawer Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            ></motion.div>

            {/* Mobile Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white shadow-premium z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-2xl font-bold tracking-widest text-primary">
                    ATELIER
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl text-primary hover:text-secondary transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-base tracking-wider font-medium text-text hover:text-primary transition-colors py-1 border-b border-background"
                    >
                      {link.name}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-base tracking-wider font-semibold text-primary hover:text-secondary transition-colors py-1 border-b border-background flex items-center gap-2"
                    >
                      <FiGrid /> Admin Panel
                    </Link>
                  )}
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-background pt-6">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <FiUser className="text-xl text-primary" />
                      <div>
                        <p className="text-xs text-neutral font-semibold">LOGGED IN AS</p>
                        <p className="text-sm font-medium text-text">{user?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-2.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-semibold tracking-wider transition-colors flex items-center justify-center"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
