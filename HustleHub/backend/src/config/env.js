// Loads and validates environment variables ONCE, at startup.
// The server refuses to start (with a clear message) if anything required
// is missing - so you never get a confusing error later at login time.
const path = require('path');
const dotenv = require('dotenv');

// Always load backend/.env, no matter which folder the command is run from.
const envPath = path.resolve(__dirname, '..', '..', '.env');
const result = dotenv.config({ path: envPath });

// In Docker the variables come from docker-compose (env_file), so a missing
// .env file is fine there. Only complain if variables are also missing.
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key] || !process.env[key].trim());

if (missing.length > 0) {
  console.error('\n[config] Missing required environment variables: ' + missing.join(', '));
  if (result.error) {
    console.error('[config] Could not read ' + envPath);
    console.error('[config] Create it by copying .env.example to .env (file must be named exactly ".env" and saved as UTF-8).');
  } else {
    console.error('[config] ' + envPath + ' was found but these values are empty or missing. Fill them in and restart.');
  }
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('\n[config] JWT_SECRET is too short. Use at least 32 characters (see .env.example for a generator command).');
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI.trim(),
  dbName: process.env.DB_NAME || 'hustlehub',
  jwtSecret: process.env.JWT_SECRET.trim(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
};
