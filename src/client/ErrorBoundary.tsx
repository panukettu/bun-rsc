"use client";

import { Component, type ComponentType, type ReactNode } from "react";
import type { ErrProps } from "../server/types";

interface ErrorInfo {
	/**
	 * Captures which component contained the exception, and its ancestors.
	 */
	componentStack?: string | null;
	digest?: string | null;
}

type ErrorState =
	| {
			error: unknown;
	  }
	| {
			error: null;
	  };

type ErrorProps = {
	fallback?: ComponentType<ErrProps> | React.ReactNode;
	onError?: (error: Error, info: ErrorInfo) => void;
	onReset?: (...args: any[]) => void;
	children: ReactNode;
};

export class ErrorBoundary extends Component<ErrorProps, ErrorState> {
	constructor(props: ErrorProps) {
		super(props);
		this.state = { error: null };
	}

	resetErrorBoundary = (...args: any[]) => {
		if (this.state.error != null) {
			this.props.onReset?.(args);
			this.setState({ error: null });
		}
	};

	static getDerivedStateFromError(error: any) {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		this.props.onError?.(error, info);
	}

	render() {
		if (this.state.error) {
			const Fallback = this.props.fallback || _FBK;
			if (typeof Fallback === "function")
				return (
					<Fallback reset={this.resetErrorBoundary} error={this.state.error} />
				);
			return (
				<html lang="en">
					<body>
						<div>
							<h1>Error occured</h1>
							<p>No fallback was present</p>
							<pre>{JSON.stringify(this.state.error, null, 2)}</pre>
						</div>
					</body>
				</html>
			);
		}

		return this.props.children;
	}
}
