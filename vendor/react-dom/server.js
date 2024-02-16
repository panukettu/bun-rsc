let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-dom-server.bun.production.min.js');
} else {
	j = require('./esm/react-dom-server.bun.development.js');
}
export const { renderToNodeStream, renderToReadableStream, renderToStaticNodeStream, version } = j;
