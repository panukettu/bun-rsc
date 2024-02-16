if (process.env.NODE_ENV === 'production') {
	module.exports = require('./esm/scheduler-unstable_post_task.production.min.js');
} else {
	module.exports = require('./esm/scheduler-unstable_post_task.development.js');
}
