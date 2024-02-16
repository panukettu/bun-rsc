let s;
let l;

if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.bun.development.js');
	l = require('./esm/react-dom-server-legacy.browser.development.js');
} else {
	s = require('./esm/react-dom-server.bun.development.js');
	l = require('./esm/react-dom-server-legacy.browser.development.js');
}

export const version = s.version;
export const renderToNodeStream = s.renderToNodeStream;
export const renderToReadableStream = s.renderToReadableStream;
export const renderToStaticNodeStream = s.renderToStaticNodeStream;

export const resume = s.resume;

export const renderToString = l.renderToString;
export const renderToStaticMarkup = l.renderToStaticMarkup;
