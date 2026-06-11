/**
 * Database Seeder Utility
 *
 * Provides two functions:
 *   1. seedAdmin()     - Called on server startup to ensure the admin user exists
 *   2. seedDatabase()  - Standalone seed script to populate sample data for testing
 *
 * Usage:
 *   Auto-seed admin: Called automatically from server.js after DB connection
 *   Full seed:       Run `npm run seed` from the backend directory
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// ─── Seed Admin ───────────────────────────────────────────────────────────────
/**
 * Ensures the admin user exists in the database.
 * If not found, creates one using ADMIN_EMAIL and ADMIN_PASSWORD from .env
 * This is safe to call on every startup - it's idempotent.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '0000000000',
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

// ─── Full Database Seeder ─────────────────────────────────────────────────────
/**
 * Clears and repopulates the database with sample data.
 * Run with: npm run seed
 *
 * WARNING: This DESTROYS existing data and recreates sample records.
 * DO NOT run in production.
 */
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // ── Clear existing data ──────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared.');

    // ── Seed Users ───────────────────────────────────────────────────────────
    console.log('👤 Seeding users...');
    const users = await User.insertMany([
      {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12),
        phone: '9999999999',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543210',
        role: 'user',
        isActive: true,
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9123456789',
        role: 'user',
        isActive: true,
      },
    ]);
    console.log(`✅ ${users.length} users created.`);

    // ── Seed Categories ──────────────────────────────────────────────────────
    console.log('📂 Seeding categories...');
    const categories = await Category.insertMany([
      {
        categoryName: 'Men\'s Clothing',
        description: 'Shirts, trousers, jackets, and more for men.',
      },
      {
        categoryName: 'Women\'s Clothing',
        description: 'Dresses, tops, skirts, and more for women.',
      },
      {
        categoryName: 'Kids Clothing',
        description: 'Comfortable and stylish clothing for kids.',
      },
      {
        categoryName: 'Accessories',
        description: 'Belts, hats, scarves, and fashion accessories.',
      },
    ]);
    console.log(`✅ ${categories.length} categories created.`);

    // ── Seed Products ────────────────────────────────────────────────────────
    console.log('🛍️  Seeding products...');
    const products = await Product.insertMany([
      {
        productName: 'Classic White Formal Shirt',
        description:
          'A crisp, slim-fit white formal shirt made from 100% Egyptian cotton. Perfect for office or formal occasions.',
        category: categories[0]._id, // Men's Clothing
        price: 1299,
        stock: 100,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Light Blue', 'Grey'],
        images: [],
        isActive: true,
      },
      {
        productName: 'Slim Fit Chinos',
        description:
          'Versatile slim-fit chinos that transition effortlessly from office to weekend outings.',
        category: categories[0]._id,
        price: 1899,
        stock: 75,
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Khaki', 'Navy', 'Olive'],
        images: [],
        isActive: true,
      },
      {
        productName: 'Floral Wrap Dress',
        description:
          'An elegant floral wrap dress with a flattering silhouette. Perfect for brunches and garden parties.',
        category: categories[1]._id, // Women's Clothing
        price: 2199,
        stock: 50,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Pink Floral', 'Blue Floral', 'Yellow'],
        images: [],
        isActive: true,
      },
      {
        productName: 'Women\'s Graphic Tee',
        description:
          'Casual and comfy graphic tee with artistic prints. 100% organic cotton.',
        category: categories[1]._id,
        price: 799,
        stock: 120,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Black', 'White', 'Coral'],
        images: [],
        isActive: true,
      },
      {
        productName: 'Kids Cartoon Joggers Set',
        description:
          'Fun and comfortable cartoon-printed jogger set for kids. Super soft fabric.',
        category: categories[2]._id, // Kids Clothing
        price: 999,
        stock: 60,
        sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
        colors: ['Blue', 'Red', 'Green'],
        images: [],
        isActive: true,
      },
      {
        productName: 'Canvas Belt - Brown',
        description:
          'A classic brown canvas belt with a stainless steel buckle. Fits 28" to 42" waist.',
        category: categories[3]._id, // Accessories
        price: 499,
        stock: 200,
        sizes: ['Free Size'],
        colors: ['Brown', 'Black'],
        images: [],
        isActive: true,
      },
    ]);
    console.log(`✅ ${products.length} products created.`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────────');
    console.log('Admin Login:');
    console.log(`  Email:    ${process.env.ADMIN_EMAIL || 'admin@example.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('─────────────────────────────────────────');
    console.log('Sample User Login:');
    console.log('  Email:    alice@example.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// ─── Entry Point ──────────────────────────────────────────────────────────────
// When run directly (npm run seed), execute the full seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedAdmin };
