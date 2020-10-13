import { MutableRefObject, useRef } from 'react';
import { createContainer } from 'unstated-next';

const useSmoothScroll = () => {
	const whyKwentaRef = useRef<HTMLDivElement | null>(null);
	const howItWorksRef = useRef<HTMLDivElement | null>(null);
	const faqRef = useRef<HTMLDivElement | null>(null);

	const scrollToRef = (ref: MutableRefObject<HTMLElement | null>) => {
		if (ref && ref.current) {
			ref.current.scrollIntoView({
				behavior: 'smooth',
			});
		}
	};

	return {
		whyKwentaRef,
		howItWorksRef,
		faqRef,
		scrollToRef,
	};
};

const SmoothScroll = createContainer(useSmoothScroll);

export default SmoothScroll;
