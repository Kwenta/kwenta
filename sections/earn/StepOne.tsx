import styled from 'styled-components';

import { Heading, Description } from './common';

const StepOne = () => {
	return (
		<StepOneContainer>
			<Heading>Step 1: Deposit Liquidity</Heading>
			<Description>
				Follow the link to Arrakis and deposit your liquidity to the ETH/KWENTA pair.
			</Description>

			<ButtonLink href="" target="_blank" rel="noreferrer">
				<BigButton>Arrakkis ETH/KWENTA Pool ↗</BigButton>
			</ButtonLink>
		</StepOneContainer>
	);
};

const StepOneContainer = styled.div`
	margin: 50px 0;
`;

const ButtonLink = styled.a``;

const BigButton = styled.div`
	width: 100%;
	padding: 60px;
	text-transform: uppercase;
	font-size: 21px;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	display: flex;
	justify-content: center;
	align-items: center;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 15px;
`;

export default StepOne;
