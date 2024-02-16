import { Suspense } from "react/server";

export function Suspend() {
	return (
		<Suspense>
			<Waited />
		</Suspense>
	);
}

const Waited = async () => {
	await new Promise((res) => setTimeout(res, 250));
	return null;
};
