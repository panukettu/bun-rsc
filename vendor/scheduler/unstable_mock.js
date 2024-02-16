if (process.env.NODE_ENV === 'production') {
	module.exports = require('./esm/scheduler-unstable_mock.production.min.js');
} else {
	module.exports = require('./esm/scheduler-unstable_mock.development.js');
}
