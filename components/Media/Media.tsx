import dynamic from 'next/dynamic';
import { FC, ReactNode, memo } from 'react';

import { BREAKPOINTS } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

const MediaQuery = dynamic(() => import('react-responsive'), {
	ssr: false,
});

// <Media greaterThanOrEqual="md">{children}</Media>
export const DesktopOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.md}>{children}</MediaQuery>
));

// <Media between={['sm', 'md']}>{children}</Media>
export const TabletOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm} maxWidth={BREAKPOINTS.md - 1}>
		{children}
	</MediaQuery>
));

// <Media lessThan="md">{children}</Media>
export const MobileOrTabletView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery maxWidth={BREAKPOINTS.md - 1}>{children}</MediaQuery>
));

// <Media greaterThan="xs">{children}</Media>
export const MobileHiddenView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm}>{children}</MediaQuery>
));

// <Media at="xs">{children}</Media>
export const MobileOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.xs} maxWidth={BREAKPOINTS.sm - 1}>
		{children}
	</MediaQuery>
));

export const NotMobileView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm}>{children}</MediaQuery>
));
