const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Inventory';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

const validCategories = [
  'OR/Ward/PACU Supplies',
  'Emergency Items',
  'Medical Equipment',
  'MH Items',
  'DAB Items',
  'Team Kit',
  'Dental Supplies',
  'Nutrition Supplies',
  'PSP Supplies',
  'Speech Supplies',
];

async function cleanupCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const allCategories = await Category.find();
    console.log(`Found ${allCategories.length} total categories`);

    // Find categories to delete (not in the valid list)
    const categoriesToDelete = allCategories.filter(cat => !validCategories.includes(cat.name));
    
    if (categoriesToDelete.length === 0) {
      console.log('✓ No extra categories to delete. Database is clean.');
      process.exit(0);
    }

    console.log(`\nRemoving ${categoriesToDelete.length} extra categories:`);
    categoriesToDelete.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.code})`);
    });

    // Delete extra categories
    const deleteResult = await Category.deleteMany({
      name: { $nin: validCategories }
    });

    console.log(`\n✓ Successfully deleted ${deleteResult.deletedCount} extra categories`);
    
    // Show remaining categories
    const remainingCategories = await Category.find().sort({ name: 1 });
    console.log(`\nRemaining ${remainingCategories.length} categories:`);
    remainingCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up categories:', error.message);
    process.exit(1);
  }
}

cleanupCategories();
