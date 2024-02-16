let s;
let l;

if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.edge.production.min.js');
	l = require('./esm/react-dom-server-legacy.browser.production.min.js');
} else {
	s = require('./esm/react-dom-server.edge.development.js');
	l = require('./esm/react-dom-server-legacy.browser.development.js');
}
export const version = s.version;
export const renderToString = l.renderToString;
export const renderToStaticMarkup = l.renderToStaticMarkup;
export const renderToReadableStream = s.renderToReadableStream;
export const resume = s.resume;
export const prerender = s.prerender;
