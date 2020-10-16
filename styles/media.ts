import { generateMedia } from 'styled-media-query';
import { createMedia } from '@artsy/fresnel';
import mapValues from 'lodash/mapValues';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Breakpoints = Record<Breakpoint, number>;

export const breakpoints: Breakpoints = {
	xs: 0,
	sm: 480,
	md: 768,
	lg: 1150,
	xl: 1300,
};

// match fresnel media queries behavior with styled-media-query (e.g - 480 will be 479 using fresnel, so we +1)
const normalizeFresnelBreakpoint = (breakpoints: Breakpoints) =>
	// '0' needs to be ignored.
	mapValues(breakpoints, (breakpoint) => (breakpoint > 0 ? breakpoint + 1 : breakpoint));

const AppMedia = createMedia({
	breakpoints: normalizeFresnelBreakpoint(breakpoints),
});

// TODO: consider swapping this library, its a bit confusing to use "lessThan" and "greaterThan" when it doesn't actually do it... ("lessThan 768px, matches 768px...")
export const media = generateMedia({
	sm: `${breakpoints.sm}px`,
	md: `${breakpoints.md}px`,
	mdUp: `${breakpoints.md + 1}px`,
	lg: `${breakpoints.lg}px`,
	xl: `${breakpoints.xl}px`,
});

export const mediaStyles = AppMedia.createMediaStyle();

export const { Media, MediaContextProvider } = AppMedia;

export default media;
