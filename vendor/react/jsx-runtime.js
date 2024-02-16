let j;
if (process.env.NODE_ENV === 'production') {
	j = require('./esm/react-jsx-runtime.production.min.js');
} else {
	j = require('./esm/react-jsx-runtime.development.js');
}

export const { jsx, jsxs, Fragment } = j;
