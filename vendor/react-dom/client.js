import * as m from 'react-dom';

let createRoot = m.createRoot;
let hydrateRoot = m.hydrateRoot;
if (process.env.NODE_ENV !== 'production') {
	createRoot = (c, o) => {
		const i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
		i.usingClientEntryPoint = true;
		try {
			return m.createRoot(c, o);
		} finally {
			i.usingClientEntryPoint = false;
		}
	};

	hydrateRoot = (c, h, o) => {
		const i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
		i.usingClientEntryPoint = true;
		try {
			return m.hydrateRoot(c, h, o);
		} finally {
			i.usingClientEntryPoint = false;
		}
	};
}
export { createRoot, hydrateRoot };
