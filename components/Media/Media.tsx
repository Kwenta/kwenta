import { FC, ReactNode } from 'react';
import { Media } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

export const DesktopOnlyView: FC<MediaProps> = ({ children }) => (
	<Media greaterThanOrEqual="md">{children}</Media>
);

export const TabletOnlyView: FC<MediaProps> = ({ children }) => (
	<Media between={['sm', 'md']}>{children}</Media>
);

export const MobileOrTabletView: FC<MediaProps> = ({ children }) => (
	<Media lessThan="md">{children}</Media>
);

export const MobileHiddenView: FC<MediaProps> = ({ children }) => (
	<Media greaterThan="xs">{children}</Media>
);

export const MobileOnlyView: FC<MediaProps> = ({ children }) => <Media at="xs">{children}</Media>;
