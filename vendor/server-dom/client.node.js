let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-server-dom-esm-client.node.production.min.js');
} else {
	j = require('./esm/react-server-dom-esm-client.node.development.js');
}

export const { createFromNodeStream, createServerReference, createFromReadableStream } = j;
