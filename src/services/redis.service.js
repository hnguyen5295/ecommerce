'use strict';

const redis = require('redis');
const { promisify } = require('util');
const { reserveInventory } = require('../models/repositories/inventory.repo');
const redisClient = redis.createClient();

const pExpire = promisify(redisClient.pExpire).bind(redisClient);
const setNxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Optimistic lock
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // locks in 3 seconds

  for (let i = 0; i < retryTimes; i++) {
    const result = await setNxAsync(key, expireTime);
    console.log(`result::`, result);

    if (result === 1) {
      // Do something with Inventory
      const isReserved = await reserveInventory({ productId, quantity, cartId });
      if (isReserved.modifiedCount > 0) {
        // Mark `key` is expires
        await pExpire(key);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  return await delAsync(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
