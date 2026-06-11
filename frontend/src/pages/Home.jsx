import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiTrendingUp, FiTruck, FiShield, FiRotateCcw, FiArrowRight } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products');
      return res.data.products;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.categories;
    },
  });

  // Hero staggered transition helper
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Static reviews
  const testimonials = [
    {
      quote: "The fabric quality and fits are unmatched. It feels premium and minimalist, exactly my style.",
      author: "Marcus V.",
      title: "Architect"
    },
    {
      quote: "Exceptional service. Order placement was extremely smooth, and the UPI proof approval was done in minutes.",
      author: "Elena R.",
      title: "Creative Director"
    },
    {
      quote: "Beautiful, luxury packaging and super fast shipping. Highly recommend Atelier for premium basics.",
      author: "David K.",
      title: "Developer"
    }
  ];

  return (
    <div className="space-y-20 md:space-y-32">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-between rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background border border-primary/5 p-8 md:p-16">
        {/* Animated Background blobs for Hero */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl flex flex-col gap-6 relative z-10"
        >
          <motion.span
            variants={heroItemVariants}
            className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 w-fit px-3 py-1 rounded-full"
          >
            New Collection 2026
          </motion.span>
          
          <motion.h1
            variants={heroItemVariants}
            className="text-4xl sm:text-6xl font-bold tracking-tight leading-none text-primary"
          >
            Elevate Your <br />
            <span className="font-serif italic font-normal text-text">Everyday Style</span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="text-base sm:text-lg text-text/80 font-light max-w-lg leading-relaxed"
          >
            Handcrafted minimalist essentials built for modern aesthetics and everyday comfort. Experience luxury tailored for the contemporary mind.
          </motion.p>

          <motion.div variants={heroItemVariants} className="flex gap-4 mt-2">
            <Link
              to="/shop?category=Men%27s%20Clothing"
              className="px-6 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-secondary hover:text-primary transition-all duration-300 shadow-premium hover:scale-105"
            >
              Shop Men
            </Link>
            <Link
              to="/shop?category=Women%27s%20Clothing"
              className="px-6 py-3.5 bg-white text-primary border border-primary/10 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-background transition-all duration-300 shadow-premium hover:scale-105"
            >
              Shop Women
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Illustration/Image */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="hidden lg:block w-[450px] aspect-[3/4] rounded-2xl overflow-hidden shadow-premium border border-white/20 relative"
        >
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
            alt="Luxury apparel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
        </motion.div>
      </section>

      {/* ─── Featured Categories ─── */}
      <section className="space-y-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Featured Categories</h2>
          <p className="text-sm text-neutral font-light mt-1">Discover curated lines tailored for every occasion.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Men', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&q=80', query: "?category=Men%27s%20Clothing" },
            { name: 'Women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', query: "?category=Women%27s%20Clothing" },
            { name: 'Accessories', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80', query: "?category=Accessories" },
            { name: 'Collections', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80', query: "" }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop${cat.query}`}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-premium group border border-primary/5 cursor-pointer block"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300"></div>
              
              {/* Category info */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">Explore</span>
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-1">
                  {cat.name}
                  <FiArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Trending Products ─── */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center justify-center md:justify-start gap-2">
              Trending Products <FiTrendingUp className="text-primary text-xl" />
            </h2>
            <p className="text-sm text-neutral font-light mt-1">Our most coveted pieces chosen by customers globally.</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/30 pb-0.5 hover:border-primary transition-all"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : productsData?.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-white border border-primary/5 rounded-3xl p-8 md:p-12 shadow-premium">
        {[
          { icon: <FiTruck />, title: 'Fast Shipping', desc: 'Complimentary shipping across India on all premium orders.' },
          { icon: <FiShield />, title: 'Secure Payments', desc: 'QR code based UPI verified transfer with prompt admin reviews.' },
          { icon: <FiRotateCcw />, title: 'Easy Returns', desc: 'Hassle-free 14-day replacement policy on unworn apparel.' },
          { icon: <FiTrendingUp />, title: 'Premium Quality', desc: 'Crafted with premium fabrics engineered for luxury longevity.' }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary text-lg font-bold shadow-premium">
              {item.icon}
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">{item.title}</h4>
            <p className="text-xs text-neutral font-light leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ─── New Arrivals Carousel ─── */}
      <section className="space-y-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide">New Arrivals</h2>
          <p className="text-sm text-neutral font-light mt-1">Directly fresh from the atelier workshops.</p>
        </div>

        <div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="pb-12"
            >
              {productsData?.map((product) => (
                <SwiperSlide key={product._id} className="h-full">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* ─── Customer Testimonials ─── */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-16 border border-primary/5">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-8"
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx}>
              <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
                <p className="font-serif text-lg md:text-2xl text-primary italic font-light leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="space-y-0.5">
                  <h5 className="text-sm font-semibold tracking-wider text-text uppercase">{t.author}</h5>
                  <p className="text-xs text-neutral uppercase tracking-widest">{t.title}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="glass-card p-8 md:p-16 border border-white/20 flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold tracking-wide">ATELIER CIRCLE</h2>
          <p className="text-sm text-neutral font-light max-w-md">
            Subscribe to receive exclusive access to capsule collections, luxury edits, and private sales.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Thank you for joining the Atelier Circle.");
          }}
          className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-2"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="flex-grow px-5 py-3 border border-primary/10 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
