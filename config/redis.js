// config/redis.js
const { createClient } = require('redis');
const config = require('./config');   // adjust if your config file is named differently

let redisClient;

async function initRedis() {
  if (redisClient) return redisClient; // reuse if already connected

  redisClient = createClient({
    socket: {
      host: config.redis.host || '127.0.0.1',
      port: config.redis.port || 6379,
    },
    password: config.redis.password || undefined,
  });

  redisClient.on('connect', () => console.log(`✅ Redis connected on ${config.redis.host}:${config.redis.port}`));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err));

  await redisClient.connect();
  return redisClient;
}

function getClient() {
  if (!redisClient) {
    console.warn('⚠️ Redis not initialized — call initRedis() first');
  }
  return redisClient;
}

module.exports = { initRedis, getClient };
