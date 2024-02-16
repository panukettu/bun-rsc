let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/scheduler.production.min.js');
} else {
	j = require('./esm/scheduler.development.js');
}
export const {
	unstable_IdlePriority,
	unstable_ImmediatePriority,
	unstable_LowPriority,
	unstable_NormalPriority,
	unstable_Profiling,
	unstable_UserBlockingPriority,
	unstable_cancelCallback,
	unstable_continueExecution,
	unstable_forceFrameRate,
	unstable_getCurrentPriorityLevel,
	unstable_getFirstCallbackNode,
	unstable_next,
	unstable_now,
	unstable_pauseExecution,
	unstable_requestPaint,
	unstable_runWithPriority,
	unstable_scheduleCallback,
	unstable_shouldYield,
	unstable_wrapCallback,
} = j;
