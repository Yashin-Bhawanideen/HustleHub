const config = require('./config/env'); // validates env first - exits with a clear message if something is missing
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log('[server] HustleHub+ API listening on port ' + config.port + ' (' + config.nodeEnv + ')');
  });
}

start();
