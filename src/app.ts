/**
 * @file app.ts
 */

import app from './api/server';
import { config } from './config/AppConfig';
import { logger } from './infrastructure/Logger';

const port = config.get().server.port;

logger.info(`Server is starting on port ${port}...`);

export default {
    port,
    fetch: app.fetch,
}; 