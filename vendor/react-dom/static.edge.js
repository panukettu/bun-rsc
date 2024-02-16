let s;
if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.edge.production.min.js');
} else {
	s = require('./esm/react-dom-server.edge.development.js');
}

export const version = s.version;
export const renderToString = s.renderToString;
