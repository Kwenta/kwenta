import dynamic from 'next/dynamic'
import { FC, ReactNode, memo } from 'react'

import { BREAKPOINTS } from 'styles/media'

type MediaProps = {
	children: ReactNode
}

const MediaQuery = dynamic(() => import('react-responsive'), {
	ssr: false,
})

export const DesktopOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.md}>{children}</MediaQuery>
))

export const LargeScreenView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.lg}>{children}</MediaQuery>
))

export const SmallScreenView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery maxWidth={BREAKPOINTS.lg}>{children}</MediaQuery>
))

export const TabletOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm} maxWidth={BREAKPOINTS.md - 1}>
		{children}
	</MediaQuery>
))

export const MobileOrTabletView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery maxWidth={BREAKPOINTS.md - 1}>{children}</MediaQuery>
))

export const MobileHiddenView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm}>{children}</MediaQuery>
))

export const MobileOnlyView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.xs} maxWidth={BREAKPOINTS.sm - 1}>
		{children}
	</MediaQuery>
))

export const NotMobileView: FC<MediaProps> = memo(({ children }) => (
	<MediaQuery minWidth={BREAKPOINTS.sm}>{children}</MediaQuery>
))
