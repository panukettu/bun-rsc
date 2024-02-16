if (process.env.NODE_ENV === 'production') {
	module.exports = require('./esm/scheduler.native.production.min.js');
} else {
	module.exports = require('./esm/scheduler.native.development.js');
}
