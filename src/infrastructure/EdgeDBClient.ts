/**
 * @file EdgeDBClient.ts
 */

import * as gel from "gel";
import { logger } from '../lib/Logger';

const edgedb = gel.createClient();

logger.info('EdgeDB client initialized.');

export default edgedb;
