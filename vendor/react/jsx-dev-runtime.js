let j;

if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-jsx-dev-runtime.production.min.js');
} else {
	j = require('./esm/react-jsx-dev-runtime.development.js');
}
export const { jsxDEV, Fragment } = j;
