const amqp = require('amqplib');
const message = 'Hello RabbitMQ server';

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@localhost');
    const channel = await connection.createChannel();

    const queueName = 'test-topic';
    await channel.assertQueue(queueName, {
      durable: true,
    });

    // Send a message to consumer channel
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Message sent to consumer channel:`, message);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
