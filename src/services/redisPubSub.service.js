'use strict';

const redis = require('redis');
const subscriber = redis.createClient();
const publisher = redis.createClient();

class RedisPubSubService {
  async publish(channel, message) {
    await publisher.connect();
    await publisher.publish(channel, message);
  }

  async subscribe(channel) {
    await subscriber.connect();
    await subscriber.subscribe(channel, (message, channelName) => {
      if (channel === channelName) {
        console.log('BINGO!');
      }
      console.log('Message: ' + message + ' on channel: ' + channel + ' is arrive!');
    });
  }
}

module.exports = new RedisPubSubService();
