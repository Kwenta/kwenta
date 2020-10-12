import { useRef } from 'react';
import { createContainer } from 'unstated-next';

const useSmoothScroll = () => {
	const whyKwentaRef = useRef<HTMLDivElement | null>(null);
	const howItWorksRef = useRef<HTMLDivElement | null>(null);
	const faqRef = useRef<HTMLDivElement | null>(null);

	return {
		whyKwentaRef,
		howItWorksRef,
		faqRef,
	};
};

const SmoothScroll = createContainer(useSmoothScroll);

export default SmoothScroll;
