import { generateMedia } from 'styled-media-query'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type Breakpoints = Record<Breakpoint, number>

export const BREAKPOINTS: Breakpoints = {
	xs: 0,
	sm: 480,
	md: 768,
	lg: 1150,
	xl: 1300,
	xxl: 1500,
}

// TODO: consider swapping this library, its a bit confusing to use "lessThan" and "greaterThan" when it doesn't actually do it... ("lessThan 768px, matches 768px...")
export const media = generateMedia({
	sm: `${BREAKPOINTS.sm}px`,
	md: `${BREAKPOINTS.md}px`,
	mdUp: `${BREAKPOINTS.md + 1}px`,
	lg: `${BREAKPOINTS.lg}px`,
	lgUp: `${BREAKPOINTS.lg + 1}px`,
	xl: `${BREAKPOINTS.xl}px`,
	xxl: `${BREAKPOINTS.xxl}px`,
})

export default media
