import { FC, ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { breakpoints } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

export const DesktopView: FC<MediaProps> = ({ children }) => {
	const isDesktop = useMediaQuery({ minWidth: breakpoints.medium + 1 });

	return isDesktop ? <>{children}</> : null;
};

export const TabletView: FC<MediaProps> = ({ children }) => {
	const isTablet = useMediaQuery({
		minWidth: breakpoints.small + 1,
		maxWidth: breakpoints.medium,
	});

	return isTablet ? <>{children}</> : null;
};

export const MobileOrTabletView: FC<MediaProps> = ({ children }) => {
	const isTablet = useMediaQuery({ maxWidth: breakpoints.medium });

	return isTablet ? <>{children}</> : null;
};

export const MobileView: FC<MediaProps> = ({ children }) => {
	const isMobile = useMediaQuery({ maxWidth: breakpoints.small });

	return isMobile ? <>{children}</> : null;
};
