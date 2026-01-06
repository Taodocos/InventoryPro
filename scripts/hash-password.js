const bcryptjs = require('bcryptjs');

async function hashPassword() {
  const password = process.argv[2] || 'admin123';
  
  try {
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in MongoDB:');
    console.log(`"${hash}"`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

hashPassword();
