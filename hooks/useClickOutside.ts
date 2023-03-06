import { useEffect, useRef } from 'react';

export default function useClickOutside(onClickOutside: () => void) {
	const ref = useRef<HTMLDivElement>(null);

	const handleClickOutside = (event: any) => {
		if (ref.current && !ref.current.contains(event.target)) {
			onClickOutside();
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
		// eslint-disable-next-line
	}, []);

	return { ref };
}
