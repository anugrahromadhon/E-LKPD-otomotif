/**
 * Vercel Serverless Entrypoint
 * Bridges incoming Vercel requests to the Express application
 */

const app = require('../server');

module.exports = app;
