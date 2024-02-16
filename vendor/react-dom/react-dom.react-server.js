let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-dom.react-server.production.min.js');
} else {
	j = require('./esm/react-dom.react-server.development.js');
}
export const {
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	preconnect,
	prefetchDNS,
	preinit,
	preinitModule,
	preload,
	preloadModule,
} = j;
