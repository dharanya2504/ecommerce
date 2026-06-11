import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-primary/10 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Description */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="font-serif text-2xl font-bold tracking-widest text-primary">
            ATELIER
          </Link>
          <p className="text-sm text-text/75 leading-relaxed font-light">
            Luxury apparel crafted with precision, designed for individuals who appreciate premium quality, minimalist elegance, and modern trends.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300">
              <FiInstagram className="text-sm" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300">
              <FiTwitter className="text-sm" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300">
              <FiFacebook className="text-sm" />
            </a>
          </div>
        </div>

        {/* Shop Navigation */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">SHOPPING</h4>
          <nav className="flex flex-col gap-2.5">
            <Link to="/shop" className="text-sm text-text/85 hover:text-primary transition-colors font-light">All Collections</Link>
            <Link to="/shop?category=Men%27s%20Clothing" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Men's Apparel</Link>
            <Link to="/shop?category=Women%27s%20Clothing" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Women's Collection</Link>
            <Link to="/shop?category=Accessories" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Premium Accessories</Link>
          </nav>
        </div>

        {/* Company Policies */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">POLICIES</h4>
          <nav className="flex flex-col gap-2.5">
            <a href="#" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Terms & Conditions</a>
            <a href="#" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Privacy Policy</a>
            <a href="#" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Refund & Exchanges</a>
            <a href="#" className="text-sm text-text/85 hover:text-primary transition-colors font-light">Shipping & Tracking</a>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">CONTACT</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <FiMapPin className="text-primary mt-1 flex-shrink-0" />
              <p className="text-sm text-text/85 font-light leading-relaxed">
                102 Design Boulevard, Fashion District, Chennai, TN, India
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <FiPhone className="text-primary flex-shrink-0" />
              <p className="text-sm text-text/85 font-light">+91 44 2468 1357</p>
            </div>
            <div className="flex items-center gap-2.5">
              <FiMail className="text-primary flex-shrink-0" />
              <p className="text-sm text-text/85 font-light">concierge@atelier.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
        <p className="text-xs text-neutral tracking-wider font-light">
          &copy; {currentYear} ATELIER. All rights reserved.
        </p>
        <p className="text-xs text-neutral tracking-wider font-light">
          Design inspired by luxury minimalism. Handcrafted in India.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
