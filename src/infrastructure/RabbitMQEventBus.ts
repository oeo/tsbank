/**
 * @file RabbitMQEventBus.ts
 * @description Implements an event bus using RabbitMQ
 */

import * as amqp from 'amqplib';
import { DomainEvent } from '../lib/DomainEvent';
import { EventBus } from '../lib/EventBus';
import { logger } from '../lib/Logger';

const EXCHANGE_NAME = 'domain_events';
const EXCHANGE_TYPE = 'topic';

export class RabbitMQEventBus implements EventBus {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly connectionString: string) {}

  /**
   * connect to rabbitmq
   */
  public async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.connectionString);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });
      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * publish an event
   */
  public async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available.');
    }

    const routingKey = event.eventName;
    const message = Buffer.from(JSON.stringify(event));

    this.channel.publish(EXCHANGE_NAME, routingKey, message, {
        persistent: true,
    });
  }

  /**
   * subscribe to an event
   */
  public async subscribe(
    eventName: string,
    callback: (event: DomainEvent) => void
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available.');
    }

    const { queue } = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue, EXCHANGE_NAME, eventName);

    this.channel.consume(queue, (msg) => {
      if (msg) {
        try {
            const event = JSON.parse(msg.content.toString()) as DomainEvent;
            callback(event);
            this.channel?.ack(msg);
        } catch (error) {
          logger.error('Error processing RabbitMQ message:', error);
          this.channel?.nack(msg, false, false); // Don't requeue
        }
      }
    });
  }

  /**
   * close the connection
   */
  public async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    logger.info('RabbitMQ connection closed.');
  }
} 