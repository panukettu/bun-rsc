let s;
let l;

if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.browser.production.min.js');
	l = require('./esm/react-dom-server-legacy.browser.production.min.js');
} else {
	s = require('./esm/react-dom-server.browser.development.js');
	l = require('./esm/react-dom-server-legacy.browser.development.js');
}

export const version = s.version;
export const renderToString = l.renderToString;
export const renderToStaticMarkup = l.renderToStaticMarkup;
export const renderToNodeStream = l.renderToNodeStream;
export const renderToReadableStream = s.renderToReadableStream;
export const resume = s.resume;
