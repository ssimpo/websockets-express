'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/websocket-express.production.min.js');
} else {
  module.exports = require('./cjs/websocket-express.development.js');
}
