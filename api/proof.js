// Forward /api/proof requests to /api/proof-api handler
import handler, { config } from './proof-api.js';

export { config };
export default handler;
