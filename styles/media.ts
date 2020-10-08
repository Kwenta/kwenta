import { generateMedia } from 'styled-media-query';
import { createMedia } from '@artsy/fresnel';

export const breakpoints = {
	xs: 0,
	sm: 480,
	md: 768,
	lg: 1150,
	xl: 1300,
};

const AppMedia = createMedia({
	breakpoints: {
		xs: breakpoints.xs,
		sm: breakpoints.sm + 1,
		md: breakpoints.md + 1,
		lg: breakpoints.lg + 1,
		xl: breakpoints.xl + 1,
	},
});

export const media = generateMedia({
	sm: `${breakpoints.sm}px`,
	md: `${breakpoints.md}px`,
	lg: `${breakpoints.lg}px`,
	xl: `${breakpoints.xl}px`,
});

export const mediaStyles = AppMedia.createMediaStyle();

export const { Media, MediaContextProvider } = AppMedia;

export default media;
