const mongoose = require('mongoose');

const ReferralLinkSchema = new mongoose.Schema({
  creatorId: String,
  linkCode: String,
  originalUrl: String,
  shortUrl: String,
  customAlias: String,
  title: String,
  clickCount: Number,
  conversionCount: Number
}, { strict: false });

const ReferralLink = mongoose.model('ReferralLink', ReferralLinkSchema);

async function showReferralLinks() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev';
    await mongoose.connect(MONGODB_URI);
    
    const links = await ReferralLink.find({});
    console.log('Total referral links found:', links.length);
    
    if (links.length > 0) {
      links.forEach((link, index) => {
        console.log(`${index + 1}. Code: ${link.linkCode}`);
        console.log(`   Short URL: ${link.shortUrl}`);
        console.log(`   Original: ${link.originalUrl}`);
        console.log(`   Title: ${link.title}`);
        console.log(`   Clicks: ${link.clickCount} | Conversions: ${link.conversionCount}`);
        console.log('');
      });
    } else {
      console.log('No referral links found in database');
      
      // Check collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

showReferralLinks();