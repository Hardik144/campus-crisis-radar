/**
 * DATABASE SEEDER
 * Run with: node utils/seeder.js
 *
 * Creates:
 * - 1 Admin user
 * - 1 Student user
 * - 3 sample incidents
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Incident = require('../models/Incident');
const InvestigationNote = require('../models/InvestigationNote');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await Incident.deleteMany();
    await InvestigationNote.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created: admin@campus.edu / Admin@123`);

    // Create student user
    const student = await User.create({
      name: 'Test Student',
      email: 'student@campus.edu',
      password: 'Student@123',
      role: 'student',
    });
    console.log(`✅ Student created: student@campus.edu / Student@123`);

    // Create sample incidents
    const incidents = await Incident.insertMany([
      {
        title: 'Suspicious person near Library',
        description: 'An unknown individual has been loitering near the library entrance for over an hour.',
        type: 'Security Threat',
        status: 'investigating',
        priority: 'high',
        location: { address: 'Main Library, Block A', latitude: 12.8234, longitude: 80.0451 },
        reportedBy: student._id,
        isAnonymous: false,
      },
      {
        title: 'Water leak in Lab 204',
        description: 'A significant water pipe burst in Lab 204, causing flooding on the floor.',
        type: 'Infrastructure Damage',
        status: 'pending',
        priority: 'medium',
        location: { address: 'Engineering Block, Lab 204', latitude: 12.8240, longitude: 80.0458 },
        reportedBy: student._id,
        isAnonymous: false,
      },
      {
        title: 'Medical Emergency - Cafeteria',
        description: 'A student collapsed near the cafeteria entrance. Requires immediate medical attention.',
        type: 'Medical Emergency',
        status: 'resolved',
        priority: 'critical',
        location: { address: 'Central Cafeteria', latitude: 12.8229, longitude: 80.0445 },
        reportedBy: student._id,
        isAnonymous: false,
      },
    ]);
    console.log(`✅ ${incidents.length} sample incidents created`);

    // Add investigation note to first incident
    await InvestigationNote.create({
      incidentId: incidents[0]._id,
      note: 'Security team dispatched to the location. Area under surveillance.',
      addedBy: admin._id,
    });
    console.log('✅ Sample investigation note added');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('--- LOGIN CREDENTIALS ---');
    console.log('Admin:   admin@campus.edu   / Admin@123');
    console.log('Student: student@campus.edu / Student@123');
    console.log('-------------------------\n');

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
