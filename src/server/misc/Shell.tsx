import type { ReactNode } from "react";
import { Suspense } from "react/server";
import { resolveProps } from "../core-utils";

type ServerShellProps = {
	html: ReactNode;
	payloader: ReactNode;
};

export function ServerShell(props: ServerShellProps) {
	return (
		<>
			<Document />
			{props.html}
			<Suspense>{props.payloader}</Suspense>
		</>
	);
}

type PayloadProps = {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	promise: Promise<Bun.ReadableStreamDefaultReadResult<Uint8Array>>;
	decoder: TextDecoder;
};

export async function Payloader({ promise, reader, decoder }: PayloadProps) {
	const stream = await promise;
	if (stream.done) return null;

	const next = reader.read();
	return (
		<>
			<script
				dangerouslySetInnerHTML={{
					__html: `_nw('<p>${stream.value}');`,
				}}
			/>
			<Suspense>
				<Payloader reader={reader} promise={next} decoder={decoder} />
			</Suspense>
		</>
	);
}

const Document = () => (
	<script
		dangerouslySetInnerHTML={{
			__html:
				"_d=document;_nd=_d.implementation.createHTMLDocument();_nw=(p)=>{_nd.write(p);_d.currentScript.remove();};_d.currentScript.remove();",
		}}
	/>
);

export async function ContentShell({
	children,
	fallback,
	layoutProps,
}: {
	children: (props: any) => ReactNode;
	fallback?: string;
	layoutProps?: any;
}) {
	return (
		<>
			{fallback && <FBK fallback={fallback} />}
			{children(layoutProps && (await resolveProps(layoutProps)))}
		</>
	);
}

export const FBK = ({ fallback }: { fallback?: string }) =>
	fallback && (
		<script
			async
			type="module"
			dangerouslySetInnerHTML={{
				__html: `import {Fallback} from "${fallback}";window._FBK = Fallback;`,
			}}
		/>
	);
