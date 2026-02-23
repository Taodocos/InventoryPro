const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Inventory';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

const defaultCategories = [
  { name: 'OR/Ward/PACU Supplies', code: 'SUPP', description: 'Operating room, ward, and PACU supplies' },
  { name: 'Emergency Items', code: 'ER', description: 'Emergency and critical items' },
  { name: 'Medical Equipment', code: 'Equip', description: 'Medical equipment and devices' },
  { name: 'MH Items', code: 'MH', description: 'Mental health related items' },
  { name: 'DAB Items', code: 'DAB', description: 'DAB department items' },
  { name: 'Team Kit', code: 'TK', description: 'Team kits and packages' },
  { name: 'Dental Supplies', code: 'DEN', description: 'Dental supplies and materials' },
  { name: 'Nutrition Supplies', code: 'NUT', description: 'Nutrition and dietary supplies' },
  { name: 'PSP Supplies', code: 'PSP', description: 'PSP department supplies' },
  { name: 'Speech Supplies', code: 'SPE', description: 'Speech therapy supplies' },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} categories already exist. Skipping seed.`);
      process.exit(0);
    }

    // Insert default categories
    const result = await Category.insertMany(defaultCategories);
    console.log(`✓ Successfully seeded ${result.length} categories:`);
    result.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error.message);
    process.exit(1);
  }
}

seedCategories();
