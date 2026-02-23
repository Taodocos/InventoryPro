const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Inventory';

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Location = mongoose.model('Location', LocationSchema);

const defaultLocations = [
  { name: 'Addis Ababa', code: 'AA', description: 'Main warehouse in Addis Ababa' },
  { name: 'Cairo', code: 'CA', description: 'Cairo branch warehouse' },
  { name: 'Dubai', code: 'DXB', description: 'Dubai distribution center' },
  { name: 'Nairobi', code: 'NRB', description: 'Nairobi regional office' },
  { name: 'Lagos', code: 'LOS', description: 'Lagos branch' },
  { name: 'Johannesburg', code: 'JNB', description: 'Johannesburg warehouse' },
];

async function seedLocations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if locations already exist
    const existingCount = await Location.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} locations already exist. Skipping seed.`);
      process.exit(0);
    }

    // Insert default locations
    const result = await Location.insertMany(defaultLocations);
    console.log(`✓ Successfully seeded ${result.length} locations:`);
    result.forEach(loc => {
      console.log(`  - ${loc.name} (${loc.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding locations:', error.message);
    process.exit(1);
  }
}

seedLocations();
