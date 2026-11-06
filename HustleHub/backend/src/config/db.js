// Override Node's default DNS servers with Google (8.8.8.8) and Cloudflare (1.1.1.1).
// This helps when the local network's DNS cannot resolve the Azure Cosmos DB
// hostname, which is a common cause of connection errors (Node.js, n.d.).
const dns = require('dns');
   dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connects the application to Azure Cosmos DB using the MongoDB API.
 * The function is asynchronous because establishing a connection is a
 * network operation that returns a promise (Mongoose, n.d.).
 */
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
// Export the function so it can be called from the main server file
// (e.g. connectDB(); in server.js).
module.exports = connectDB;

// Reference List
// Google Developers (n.d.) Google Public DNS. Available at: https://developers.google.com/speed/public-dns (Accessed: 12 October 2026).
// Microsoft (n.d.) What is Azure Cosmos DB for MongoDB? Available at: https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/introduction (Accessed: 12 October 2026).
// Mongoose (n.d.) Connections. Available at: https://mongoosejs.com/docs/connections.html (Accessed: 12 October 2026).
// Node.js (n.d.) DNS | Node.js documentation. Available at: https://nodejs.org/api/dns.html (Accessed: 12 October 2026).
