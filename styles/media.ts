import { generateMedia } from 'styled-media-query';

export const media = generateMedia({
	small: '480px',
	medium: '768px',
	large: '1150px',
	extraLarge: '1300px',
});

export default media;
