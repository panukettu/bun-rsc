let rs;

if (process.env.NODE_ENV === 'production') {
	rs = require('./esm/react.react-server.production.min.js');
} else {
	rs = require('./esm/react.react-server.development.js');
}

export const {
	Children,
	Fragment,
	Profiler,
	StrictMode,
	Suspense,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	__SECRET_SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	cache,
	cloneElement,
	createElement,
	createRef,
	experimental_taintObjectReference,
	experimental_taintUniqueValue,
	forwardRef,
	isValidElement,
	lazy,
	memo,
	startTransition,
	unstable_DebugTracingMode,
	unstable_SuspenseList,
	unstable_getCacheForType,
	unstable_getCacheSignal,
	unstable_postpone,
	use,
	useCallback,
	useContext,
	useDebugValue,
	useId,
	useMemo,
	version,
} = rs;
