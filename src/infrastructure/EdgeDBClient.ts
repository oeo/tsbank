/**
 * @file EdgeDBClient.ts
 */

import createClient from 'edgedb';
import { logger } from '../lib/Logger';

const client = createClient();

logger.info('EdgeDB client initialized.');

export { client as edgedb }; 