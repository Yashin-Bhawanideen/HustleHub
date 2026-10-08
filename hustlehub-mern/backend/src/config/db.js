   const dns = require('dns');
   dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.dbName,
      serverSelectionTimeoutMS: 20000
    });
    console.log('[db] Connected to Azure Cosmos DB (MongoDB API), database: ' + config.dbName);
  } catch (err) {
    console.error('[db] Could not connect to the database: ' + err.message);
    console.error('[db] Check: (1) MONGODB_URI is copied correctly from the Azure portal,');
    console.error('[db]        (2) <password> was replaced and special characters are URL-encoded,');
    console.error('[db]        (3) the cluster is running and public network access is allowed.');
    process.exit(1);
  }
}

module.exports = connectDB;
