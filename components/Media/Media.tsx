import { FC, ReactNode, memo } from 'react';

import { Media } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

export const DesktopOnlyView: FC<MediaProps> = memo(({ children }) => (
	<Media greaterThanOrEqual="md">{children}</Media>
));

export const TabletOnlyView: FC<MediaProps> = memo(({ children }) => (
	<Media between={['sm', 'md']}>{children}</Media>
));

export const MobileOrTabletView: FC<MediaProps> = memo(({ children }) => (
	<Media lessThan="md">{children}</Media>
));

export const MobileHiddenView: FC<MediaProps> = memo(({ children }) => (
	<Media greaterThan="xs">{children}</Media>
));

export const MobileOnlyView: FC<MediaProps> = memo(({ children }) => (
	<Media at="xs">{children}</Media>
));
