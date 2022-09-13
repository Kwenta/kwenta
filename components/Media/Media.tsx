import React, { FC, ReactNode } from 'react';

import { Media } from 'styles/media';

type MediaProps = {
	children: ReactNode;
};

export const DesktopOnlyView: FC<MediaProps> = React.memo(({ children }) => (
	<Media greaterThanOrEqual="md">{children}</Media>
));

export const TabletOnlyView: FC<MediaProps> = React.memo(({ children }) => (
	<Media between={['sm', 'md']}>{children}</Media>
));

export const MobileOrTabletView: FC<MediaProps> = React.memo(({ children }) => (
	<Media lessThan="md">{children}</Media>
));

export const MobileHiddenView: FC<MediaProps> = React.memo(({ children }) => (
	<Media greaterThan="xs">{children}</Media>
));

export const MobileOnlyView: FC<MediaProps> = React.memo(({ children }) => (
	<Media at="xs">{children}</Media>
));
