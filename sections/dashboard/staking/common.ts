import styled from 'styled-components';

export const StakingCard = styled.div`
	background: linear-gradient(0deg, #181818, #181818),
		linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
	padding: 20px;
	border-radius: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
`;
