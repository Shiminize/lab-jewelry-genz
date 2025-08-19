const mongoose = require('mongoose');

// Simple schema for checking
const CreatorSchema = new mongoose.Schema({
  creatorCode: String,
  displayName: String,
  email: String,
  status: String,
  createdAt: Date
}, { strict: false });

const Creator = mongoose.model('Creator', CreatorSchema);

async function checkCreators() {
  try {
    // Use the same MongoDB URI as the application
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const creators = await Creator.find({}).select('creatorCode displayName email status createdAt');
    console.log('Total creators found:', creators.length);
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Collection:', mongoose.connection.collections.creators ? 'exists' : 'missing');
    
    if (creators.length > 0) {
      creators.forEach((creator, index) => {
        console.log(`${index + 1}. ${creator.creatorCode} - ${creator.displayName} (${creator.status}) - ${creator.email}`);
      });
    } else {
      console.log('No creators found in database');
      
      // Check all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCreators();