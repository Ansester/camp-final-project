#!/usr/bin/env node

/**
 * Database Seed Script for CAMP
 *
 * Populates MongoDB with sample data for development and testing.
 *
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --drop  (drops existing data first)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Item = require('../models/Item');
const Facility = require('../models/Facility');
const Borrowal = require('../models/Borrowal');
const Reservation = require('../models/Reservation');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const Waitlist = require('../models/Waitlist');

const dropData = process.argv.includes('--drop');

async function seed() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI || !/^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/camp_demo(\?|$)/.test(mongoURI) || process.env.NODE_ENV === 'production') {
      throw new Error('Seeding is restricted to a local database named camp_demo; no remote or production database is allowed');
    }
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Drop existing data if requested
    if (dropData) {
      await Promise.all([
        User.deleteMany({}),
        Item.deleteMany({}),
        Facility.deleteMany({}),
        Borrowal.deleteMany({}),
        Reservation.deleteMany({}),
        Fine.deleteMany({}),
        Notification.deleteMany({}),
        Waitlist.deleteMany({})
      ]);
      console.log('✓ Dropped existing data');
    }

    // Create Facilities
    console.log('\n→ Creating facilities...');
    const facilities = await Facility.insertMany([
      {
        name: 'Library',
        description: 'Laptops, tablets, and study equipment',
        location: {
          building: 'Bobst Library',
          room: 'Circulation Desk',
          floor: 'Ground Floor'
        },
        contactEmail: 'library@univ.edu',
        contactPhone: '212-555-1001',
        operatingHours: {
          monday: { open: '08:00', close: '23:00' },
          tuesday: { open: '08:00', close: '23:00' },
          wednesday: { open: '08:00', close: '23:00' },
          thursday: { open: '08:00', close: '23:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '10:00', close: '20:00' },
          sunday: { open: '10:00', close: '22:00' }
        }
      },
      {
        name: 'IM Center',
        description: 'Professional camera and audio/video equipment',
        location: {
          building: 'Tisch Hall',
          room: '210',
          floor: '2nd Floor'
        },
        contactEmail: 'imcenter@univ.edu',
        contactPhone: '212-555-1002',
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '17:00' },
          sunday: { open: '12:00', close: '18:00' }
        }
      },
      {
        name: 'Arts Center',
        description: 'Art supplies, lighting, and creative equipment',
        location: {
          building: 'Silver Arts Building',
          room: '101',
          floor: '1st Floor'
        },
        contactEmail: 'artscenter@univ.edu',
        contactPhone: '212-555-1003',
        operatingHours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '18:00' }
        }
      }
    ]);
    console.log(`✓ Created ${facilities.length} facilities`);

    // Create Users
    console.log('\n→ Creating users...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const hashedStaffPassword = await bcrypt.hash('StaffPass123!', 10);

    const students = await User.insertMany([
      {
        netId: 'si2356',
        email: 'si2356@univ.edu',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'student',
        phone: '412-555-0101'
      },
      {
        netId: 'ls1842',
        email: 'ls1842@univ.edu',
        password: hashedPassword,
        firstName: 'Leah',
        lastName: 'Sullivan',
        role: 'student',
        phone: '412-555-0102'
      },
      {
        netId: 'mt2201',
        email: 'mt2201@univ.edu',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Thompson',
        role: 'student',
        phone: '412-555-0103'
      },
      {
        netId: 'ak1016',
        email: 'ak1016@univ.edu',
        password: hashedPassword,
        firstName: 'Akshith',
        lastName: 'Kumar',
        role: 'student',
        phone: '412-555-0104'
      },
      {
        netId: 'ew3847',
        email: 'ew3847@univ.edu',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'student',
        phone: '412-555-0105'
      }
    ]);

    const staff = await User.insertMany([
      {
        netId: 'staff01',
        email: 'staff@univ.edu',
        password: hashedStaffPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: 'staff',
        phone: '412-555-0200'
      }
    ]);
    console.log(`✓ Created ${students.length} students and ${staff.length} staff`);

    // Create Items
    console.log('\n→ Creating items...');
    const items = await Item.insertMany([
      // ===== LIBRARY EQUIPMENT =====
      {
        name: 'MacBook Pro 16" M3 Pro',
        category: 'Computer',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 10,
        description: 'M3 Pro laptop',
        assetId: 'LAP-MBP16-001',
        condition: 'excellent',
        tags: ['laptop', 'apple', 'video-editing', 'development']
      },
      {
        name: 'MacBook Pro 14" M3',
        category: 'Computer',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 8,
        description: 'M3 laptop',
        assetId: 'LAP-MBP14-001',
        condition: 'good',
        tags: ['laptop', 'apple', 'portable', 'compact']
      },
      {
        name: 'Dell XPS 15',
        category: 'Computer',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 6,
        description: 'Windows laptop',
        assetId: 'LAP-XPS15-001',
        condition: 'good',
        tags: ['laptop', 'windows', 'development']
      },
      {
        name: 'iPad Pro 12.9"',
        category: 'Computer',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 5,
        description: 'M2 iPad Pro with Apple Pencil',
        assetId: 'TAB-IPAD-001',
        condition: 'excellent',
        tags: ['tablet', 'apple', 'drawing', 'portable']
      },
      {
        name: 'Laptop Charger (USB-C)',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 20,
        description: '100W USB-C charger',
        assetId: 'ACC-USBC-001',
        condition: 'good',
        tags: ['charger', 'usb-c', 'power']
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        category: 'Audio',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 15,
        description: 'Noise-canceling headphones',
        assetId: 'HEAD-SONY-001',
        condition: 'excellent',
        tags: ['headphones', 'wireless', 'noise-canceling']
      },
      {
        name: 'USB-C Hub Multiport',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 12,
        description: '7-in-1 USB-C hub',
        assetId: 'ACC-HUB-001',
        condition: 'good',
        tags: ['hub', 'usb-c', 'adapter']
      },
      {
        name: 'Portable Phone Charger',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Library')._id,
        status: 'available',
        quantity: 25,
        description: '10000mAh power bank',
        assetId: 'ACC-BANK-001',
        condition: 'good',
        tags: ['charger', 'portable', 'power-bank']
      },

      // ===== IM CENTER (INTERACTIVE MEDIA) EQUIPMENT =====
      {
        name: 'Meta Quest 3 VR Headset',
        category: 'Lab Equipment',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 5,
        description: 'Mixed reality VR headset',
        assetId: 'VR-QUEST3-001',
        condition: 'excellent',
        tags: ['vr', 'headset', 'immersive', 'development']
      },
      {
        name: 'Epson PowerLite Projector',
        category: 'Lab Equipment',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 4,
        description: '1080p 3LCD projector',
        assetId: 'PROJ-EPSON-001',
        condition: 'good',
        tags: ['projector', 'presentation', 'display']
      },
      {
        name: 'Arduino Starter Kit',
        category: 'Lab Equipment',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 10,
        description: 'Electronics prototyping kit',
        assetId: 'ARD-KIT-001',
        condition: 'good',
        tags: ['arduino', 'electronics', 'prototyping']
      },
      {
        name: 'Raspberry Pi 5 Kit',
        category: 'Lab Equipment',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 8,
        description: 'Single-board computer kit',
        assetId: 'RPI-5-001',
        condition: 'excellent',
        tags: ['raspberry-pi', 'computer', 'prototyping']
      },
      {
        name: 'Wacom Cintiq 22',
        category: 'Lab Equipment',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Drawing tablet display',
        assetId: 'TAB-CINTIQ-001',
        condition: 'excellent',
        tags: ['tablet', 'drawing', 'digital-art']
      },
      {
        name: 'HDMI Cable 10ft',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 20,
        description: '4K HDMI cable',
        assetId: 'ACC-HDMI-001',
        condition: 'good',
        tags: ['cable', 'hdmi', 'video']
      },
      {
        name: 'Presentation Clicker',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'IM Center')._id,
        status: 'available',
        quantity: 15,
        description: 'Wireless presenter remote',
        assetId: 'ACC-CLICK-001',
        condition: 'good',
        tags: ['presenter', 'wireless', 'clicker']
      },

      // ===== ARTS CENTER EQUIPMENT =====
      {
        name: 'Canon EOS R5',
        category: 'Camera',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 3,
        description: 'Professional mirrorless camera',
        assetId: 'CAM-R5-001',
        condition: 'excellent',
        tags: ['mirrorless', 'professional', 'video', 'full-frame']
      },
      {
        name: 'Canon EOS Rebel T7i',
        category: 'Camera',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 5,
        description: 'Entry-level DSLR camera',
        assetId: 'CAM-T7I-001',
        condition: 'good',
        tags: ['dslr', 'beginner', 'entry-level']
      },
      {
        name: 'Sony Alpha A7 III',
        category: 'Camera',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 2,
        description: 'Full-frame mirrorless camera',
        assetId: 'CAM-A7III-001',
        condition: 'excellent',
        tags: ['mirrorless', 'full-frame', 'professional']
      },
      {
        name: 'Sony FX6 Cinema Camera',
        category: 'Camera',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 1,
        description: 'Professional cinema camera',
        assetId: 'CAM-FX6-001',
        condition: 'excellent',
        tags: ['cinema', 'professional', 'video', 'film']
      },
      {
        name: 'GoPro HERO12 Black',
        category: 'Camera',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 8,
        description: 'Waterproof action camera',
        assetId: 'CAM-GOPRO-001',
        condition: 'good',
        tags: ['action-camera', 'waterproof', 'sports', 'compact']
      },
      {
        name: 'Canon 50mm f/1.8 Lens',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 6,
        description: 'Prime lens for Canon cameras',
        assetId: 'LENS-50-001',
        condition: 'good',
        tags: ['lens', 'prime', 'portrait', 'canon']
      },
      {
        name: 'Canon 24-70mm f/2.8 Lens',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 3,
        description: 'Professional zoom lens',
        assetId: 'LENS-2470-001',
        condition: 'excellent',
        tags: ['lens', 'zoom', 'professional', 'canon']
      },
      {
        name: 'Zoom H6 Audio Recorder',
        category: 'Audio',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Portable audio recorder',
        assetId: 'AUD-H6-001',
        condition: 'good',
        tags: ['recorder', 'portable', 'podcast', 'field-recording']
      },
      {
        name: 'Rode NTG3 Shotgun Microphone',
        category: 'Audio',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 6,
        description: 'Professional shotgun microphone',
        assetId: 'MIC-NTG3-001',
        condition: 'excellent',
        tags: ['microphone', 'shotgun', 'film', 'professional']
      },
      {
        name: 'Sennheiser Wireless Lav Kit',
        category: 'Audio',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Wireless lavalier microphone system',
        assetId: 'MIC-LAV-001',
        condition: 'excellent',
        tags: ['microphone', 'wireless', 'lavalier', 'interview']
      },
      {
        name: 'Audio-Technica ATH-M50x',
        category: 'Audio',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 12,
        description: 'Studio monitor headphones',
        assetId: 'HEAD-M50X-001',
        condition: 'good',
        tags: ['headphones', 'studio', 'monitoring']
      },
      {
        name: 'Boom Pole with Shock Mount',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 8,
        description: 'Carbon fiber boom pole',
        assetId: 'AUD-BOOM-001',
        condition: 'good',
        tags: ['boom', 'audio', 'film', 'accessory']
      },
      {
        name: 'Aputure 300D II LED Light',
        category: 'Lighting',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Professional LED light',
        assetId: 'LIT-300D-001',
        condition: 'excellent',
        tags: ['led', 'professional', 'video', 'continuous']
      },
      {
        name: '3-Point LED Lighting Kit',
        category: 'Lighting',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 3,
        description: 'Complete LED lighting kit',
        assetId: 'LIT-KIT-001',
        condition: 'good',
        tags: ['kit', 'led', 'softbox', 'portable']
      },
      {
        name: 'Godox V1 Flash',
        category: 'Lighting',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 6,
        description: 'Round-head flash speedlight',
        assetId: 'FLASH-V1-001',
        condition: 'excellent',
        tags: ['flash', 'speedlight', 'portrait', 'wireless']
      },
      {
        name: 'Light Stand Set (3)',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 5,
        description: 'Set of 3 adjustable light stands',
        assetId: 'STAND-LIT-001',
        condition: 'good',
        tags: ['stand', 'lighting', 'accessory']
      },
      {
        name: 'Reflector Kit 5-in-1',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 8,
        description: '43" collapsible reflector',
        assetId: 'REFL-5IN1-001',
        condition: 'good',
        tags: ['reflector', 'portrait', 'lighting']
      },
      {
        name: 'Manfrotto 190 Tripod',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 8,
        description: 'Aluminum photo tripod',
        assetId: 'TRI-190-001',
        condition: 'good',
        tags: ['tripod', 'photography', 'stable', 'aluminum']
      },
      {
        name: 'Manfrotto Video Tripod',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Fluid-head video tripod',
        assetId: 'TRI-VID-001',
        condition: 'excellent',
        tags: ['tripod', 'video', 'fluid-head', 'professional']
      },
      {
        name: 'DJI RS 3 Gimbal',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 3,
        description: '3-axis gimbal stabilizer',
        assetId: 'GIM-RS3-001',
        condition: 'excellent',
        tags: ['gimbal', 'stabilizer', 'video', 'handheld']
      },
      {
        name: 'Slider 24" Carbon Fiber',
        category: 'Accessory',
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        status: 'available',
        quantity: 4,
        description: 'Camera slider for video',
        assetId: 'SLIDE-24-001',
        condition: 'good',
        tags: ['slider', 'video', 'cinematic']
      }
    ]);

    // Set quantityAvailable equal to quantity for all items
    await Promise.all(items.map(item =>
      Item.findByIdAndUpdate(item._id, { quantityAvailable: item.quantity })
    ));
    console.log(`✓ Created ${items.length} items`);

    // Create Borrowals
    console.log('\n→ Creating borrowals...');
    const now = new Date();
    const borrowals = await Borrowal.insertMany([
      // Active borrowals
      {
        user: students[0]._id, // Sarah
        item: items.find(i => i.name === 'Canon EOS R5')._id,
        checkoutDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        checkedOutBy: staff[0]._id
      },
      {
        user: students[1]._id, // Leah
        item: items.find(i => i.name === 'Zoom H6 Audio Recorder')._id,
        checkoutDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        checkedOutBy: staff[0]._id
      },
      {
        user: students[2]._id, // Michael
        item: items.find(i => i.name === 'Manfrotto 190 Tripod')._id,
        checkoutDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        checkedOutBy: staff[0]._id
      },
      {
        user: students[3]._id, // Akshith
        item: items.find(i => i.name === 'MacBook Pro 16" M3 Pro')._id,
        checkoutDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
        status: 'active',
        checkedOutBy: staff[0]._id
      },
      // Returned borrowals (history)
      {
        user: students[0]._id,
        item: items.find(i => i.name === 'Sony Alpha A7 III')._id,
        checkoutDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000),
        returnDate: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000),
        status: 'returned',
        conditionOnReturn: 'good',
        checkedOutBy: staff[0]._id
      },
      {
        user: students[1]._id,
        item: items.find(i => i.name === 'Rode NTG3 Shotgun Microphone')._id,
        checkoutDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        returnDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        status: 'returned',
        conditionOnReturn: 'good',
        checkedOutBy: staff[0]._id
      }
    ]);
    console.log(`✓ Created ${borrowals.length} borrowals`);

    // Create Reservations
    console.log('\n→ Creating reservations...');
    const reservations = await Reservation.insertMany([
      {
        user: students[3]._id,
        item: items.find(i => i.name === '3-Point LED Lighting Kit')._id,
        reservationDate: new Date(),
        pickupDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + 26 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        user: students[4]._id,
        item: items.find(i => i.name === 'Boom Pole with Shock Mount')._id,
        reservationDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        pickupDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + 28 * 60 * 60 * 1000),
        status: 'confirmed'
      }
    ]);
    console.log(`✓ Created ${reservations.length} reservations`);

    // Create Fines
    console.log('\n→ Creating fines...');
    const fines = await Fine.insertMany([
      {
        user: students[1]._id,
        borrowal: borrowals.find(b => b.user.equals(students[1]._id) && b.status === 'overdue')._id,
        amount: 5.00,
        reason: 'late-return',
        description: 'Overdue – Zoom H6 Audio Recorder',
        status: 'pending'
      },
      {
        user: students[2]._id,
        borrowal: borrowals.find(b => b.user.equals(students[2]._id) && b.status === 'overdue')._id,
        amount: 12.50,
        reason: 'damage',
        description: 'Damage – Manfrotto 190 Tripod leg bent',
        status: 'pending'
      },
      {
        user: students[0]._id,
        amount: 3.00,
        reason: 'late-return',
        description: 'Late – Sony Alpha A7 III (1 day)',
        status: 'paid',
        paidDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`✓ Created ${fines.length} fines`);

    // Create Notifications
    console.log('\n→ Creating notifications...');
    const notifications = await Notification.insertMany([
      {
        user: students[0]._id,
        type: 'reminder',
        title: 'Item Due Soon',
        message: 'Your Canon EOS R5 is due in 2 days. Please return it to the Arts Centre.',
        relatedItem: items.find(i => i.name === 'Canon EOS R5')._id,
        isRead: false
      },
      {
        user: students[1]._id,
        type: 'overdue',
        title: 'Overdue Item',
        message: 'Your Zoom H6 Audio Recorder is overdue. Please return it as soon as possible to avoid additional fines.',
        relatedItem: items.find(i => i.name === 'Zoom H6 Audio Recorder')._id,
        isRead: false
      },
      {
        user: students[3]._id,
        type: 'reservation',
        title: 'Reservation Ready',
        message: 'Your reserved 3-Point LED Lighting Kit is ready for pickup at Arts Center.',
        relatedReservation: reservations[0]._id,
        isRead: false
      }
    ]);
    console.log(`✓ Created ${notifications.length} notifications`);

    // Create Waitlist entries
    console.log('\n→ Creating waitlist entries...');
    const waitlistEntries = await Waitlist.insertMany([
      {
        user: students[4]._id,
        item: items.find(i => i.name === 'Canon EOS R5')._id,
        facility: facilities.find(f => f.name === 'Arts Center')._id,
        position: 1,
        status: 'waiting'
      }
    ]);
    console.log(`✓ Created ${waitlistEntries.length} waitlist entries`);

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${facilities.length} facilities`);
    console.log(`  - ${students.length} students`);
    console.log(`  - ${staff.length} staff members`);
    console.log(`  - ${items.length} items`);
    console.log(`  - ${borrowals.length} borrowals`);
    console.log(`  - ${reservations.length} reservations`);
    console.log(`  - ${fines.length} fines`);
    console.log(`  - ${notifications.length} notifications`);
    console.log(`  - ${waitlistEntries.length} waitlist entries`);

    console.log('\nTest Credentials:');
    console.log('  Student: si2356@univ.edu / Password123!');
    console.log('  Staff:   staff@univ.edu / StaffPass123!');

  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

if (require.main === module) seed();
module.exports = seed;
