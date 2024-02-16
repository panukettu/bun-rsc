let s;
let l;
if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.node.production.min.js');
	l = require('./esm/react-dom-server-legacy.node.production.min.js');
} else {
	s = require('./esm/react-dom-server.node.development.js');
	l = require('./esm/react-dom-server-legacy.node.development.js');
}
export const version = s.version;
export const renderToString = l.renderToString;
export const renderToStaticMarkup = l.renderToStaticMarkup;
export const renderToStaticNodeStream = l.renderToStaticNodeStream;
export const renderToNodeStream = l.renderToNodeStream;
export const renderToPipeableStream = s.renderToPipeableStream;
export const prerenderToNodeStream = s.prerenderToNodeStream;
export const resumeToPipeableStream = s.resumeToPipeableStream;
