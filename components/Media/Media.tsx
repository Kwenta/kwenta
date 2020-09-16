import { FC, ReactNode } from 'react';
import { Media } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

export const DesktopView: FC<MediaProps> = ({ children }) => (
	<Media greaterThanOrEqual="md">{children}</Media>
);

export const TabletView: FC<MediaProps> = ({ children }) => (
	<Media between={['sm', 'md']}>{children}</Media>
);

export const MobileOrTabletView: FC<MediaProps> = ({ children }) => (
	<Media lessThan="md">{children}</Media>
);

export const MobileView: FC<MediaProps> = ({ children }) => <Media at="xs">{children}</Media>;
