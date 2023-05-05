import { useEffect, useState } from 'react';

import { Breakpoint, BREAKPOINTS } from 'styles/media';

interface Size {
	width: number | undefined;
	height: number | undefined;
}

interface ReturnValue extends Size {
	lessThanWidth: (breakpoint: Breakpoint) => boolean;
	greaterThanWidth: (breakpoint: Breakpoint) => boolean;
}

export default function useWindowSize(): ReturnValue {
	const [windowSize, setWindowSize] = useState<Size>({
		width: undefined,
		height: undefined,
	});

	const lessThanWidth = (breakpoint: Breakpoint) => {
		if (!windowSize?.width) return false;
		const bpSize = BREAKPOINTS[breakpoint];
		return windowSize.width < bpSize;
	};

	const greaterThanWidth = (breakpoint: Breakpoint) => {
		if (!windowSize?.width) return false;
		const bpSize = BREAKPOINTS[breakpoint];
		return windowSize.width > bpSize;
	};

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	return {
		...windowSize,
		lessThanWidth,
		greaterThanWidth,
	};
}
