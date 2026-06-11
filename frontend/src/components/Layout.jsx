import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import BackgroundBlobs from './BackgroundBlobs';

const Layout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  // Determine if the route is an admin route to optionally adjust styles
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Luxury Slow Background Blobs */}
      <BackgroundBlobs />

      {/* Sticky Blurred Navbar */}
      <Navbar onCartOpen={() => setIsCartOpen(true)} />

      {/* Cart Drawer from Right */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Page Area with Framer Motion Page Transition */}
      <main className="flex-grow pt-24 md:pt-28 pb-16 relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1], // Luxury cubic bezier easing
            }}
            className="page-transition"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Elegant Footer */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;
