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
	breakpoints,
});

export const scMedia = generateMedia({
	sm: `${breakpoints.sm}px`,
	md: `${breakpoints.md}px`,
	lg: `${breakpoints.lg}px`,
	xl: `${breakpoints.xl}px`,
});

export const mediaStyles = AppMedia.createMediaStyle();

export const { Media, MediaContextProvider } = AppMedia;

export default scMedia;
