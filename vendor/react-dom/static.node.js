let s;
if (process.env.NODE_ENV === 'production') {
	s = require('./esm/react-dom-server.node.production.min.js');
} else {
	s = require('./esm/react-dom-server.node.development.js');
}

export const renderToStaticNodeStream = s.renderToStaticNodeStream;
export const renderToNodeStream = s.renderToNodeStream;

export const version = s.version;
