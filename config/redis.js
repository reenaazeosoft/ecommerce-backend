// config/redis.js
const { createClient } = require('redis');
const config = require('./config');

let redisClient;

async function initRedis() {
  if (redisClient) return redisClient; // reuse if already connected

  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port
    },
    password: config.redis.password || undefined
  });

  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err));

  await redisClient.connect();
  return redisClient;
}

// Export helper to get client instance
module.exports = {
  initRedis,
  getClient: () => redisClient
};
