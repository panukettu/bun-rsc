let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-server-dom-esm-client.browser.production.min.js');
} else {
	j = require('./esm/react-server-dom-esm-client.browser.development.js');
}
export const { createFromFetch, createFromReadableStream, createServerReference, encodeReply } = j;
