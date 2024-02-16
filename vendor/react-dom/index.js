let j;
function checkDCE() {
	/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	if (
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
	) {
		return;
	}
	if (process.env.NODE_ENV !== 'production') {
		// This branch is unreachable because this function is only called
		// in production, but the condition is true only in development.
		// Therefore if the branch is still here, dead code elimination wasn't
		// properly applied.
		// Don't change the message. React DevTools relies on it. Also make sure
		// this message doesn't occur elsewhere in this function, or it will cause
		// a false positive.
		throw new Error('^_^');
	}
	try {
		// Verify that the code above has been dead code eliminated (DCE'd).
		__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
	} catch (err) {
		// DevTools shouldn't crash React, no matter what.
		// We should still report in case we break this code.
		console.error(err);
	}
}

if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-dom.production.min.js');
	// DCE check should happen before ReactDOM bundle executes so that
	// DevTools can report bad minification during injection.
	// checkDCE();
	// m = await import('./esm/react-dom.production.min.js');
} else {
	j = require('./esm/react-dom.development.js');
}

export const {
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	createPortal,
	createRoot,
	experimental_useFormState,
	experimental_useFormStatus,
	findDOMNode,
	flushSync,
	hydrate,
	hydrateRoot,
	preconnect,
	prefetchDNS,
	preinit,
	preinitModule,
	preload,
	preloadModule,
	render,
	unmountComponentAtNode,
	unstable_batchedUpdates,
	unstable_renderSubtreeIntoContainer,
	unstable_runWithPriority,
	useFormState,
	useFormStatus,
	version,
} = j;
