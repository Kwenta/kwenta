import { createMedia } from '@artsy/fresnel';
import mapValues from 'lodash/mapValues';
import { generateMedia } from 'styled-media-query';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type Breakpoints = Record<Breakpoint, number>;

export const BREAKPOINTS: Breakpoints = {
	xs: 0,
	sm: 480,
	md: 768,
	lg: 1150,
	xl: 1300,
	xxl: 1500,
};

// match fresnel media queries behavior with styled-media-query (e.g - 480 will be 479 using fresnel, so we +1)
const normalizeFresnelBreakpoint = (breakpoints: Breakpoints) =>
	// '0' needs to be ignored.
	mapValues(breakpoints, (breakpoint) => (breakpoint > 0 ? breakpoint + 1 : breakpoint));

const AppMedia = createMedia({
	breakpoints: normalizeFresnelBreakpoint(BREAKPOINTS),
});

// TODO: consider swapping this library, its a bit confusing to use "lessThan" and "greaterThan" when it doesn't actually do it... ("lessThan 768px, matches 768px...")
export const media = generateMedia({
	sm: `${BREAKPOINTS.sm}px`,
	md: `${BREAKPOINTS.md}px`,
	mdUp: `${BREAKPOINTS.md + 1}px`,
	lg: `${BREAKPOINTS.lg}px`,
	xl: `${BREAKPOINTS.xl}px`,
	xxl: `${BREAKPOINTS.xxl}px`,
});

export const mediaStyles = AppMedia.createMediaStyle();

export const { Media, MediaContextProvider } = AppMedia;

export default media;
