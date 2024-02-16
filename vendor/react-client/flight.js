let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-client-flight.production.min.js');
} else {
	j = require('./esm/react-client-flight.development.js');
}
export const { close, createResponse, getRoot, processBinaryChunk, reportGlobalError } = j;
