import { generateMedia } from 'styled-media-query';

export const breakpoints = {
	small: 480,
	medium: 768,
	large: 1150,
	extraLarge: 1300,
};

export const media = generateMedia({
	small: `${breakpoints.small}px`,
	medium: `${breakpoints.medium}px`,
	large: `${breakpoints.large}px`,
	extraLarge: `${breakpoints.extraLarge}px`,
});

export default media;
