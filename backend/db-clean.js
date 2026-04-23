const mongoose = require('mongoose');

// Aapka Atlas URI
const uri = "mongodb+srv://hotel-alphanexis-db:alphanexis_hotel_db@hotel-website.e421by6.mongodb.net/?appName=Hotel-website";

async function cleanDB() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(uri);
        
        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`DELETED: All documents from [${collection.collectionName}]`);
        }
        
        console.log("\n✅ SUCCESS: Database is now empty!");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        process.exit(1);
    }
}

cleanDB();
