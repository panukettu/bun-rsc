let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-server-dom-esm-server.node.production.min.js');
} else {
	j = require('./esm/react-server-dom-esm-server.node.development.js');
}
export const {
	decodeAction,
	decodeFormState,
	decodeReply,
	decodeReplyFromBusboy,
	registerClientReference,
	registerServerReference,
	renderToPipeableStream,
	renderToReadableStream,
	createClientModuleProxy,
} = j;
