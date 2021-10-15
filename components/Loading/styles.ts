import styled from 'styled-components';
import Image from 'next/image';

export const Root = styled.div`
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	width: 100%;
`;

export const Img = styled(Image)`
	@keyframes grow {
		to {
			transform: scale(1.2);
		}
	}
	width: 40%;
	animation: grow 1500ms ease-in-out forwards;
`;
