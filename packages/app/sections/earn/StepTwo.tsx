import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Heading, Description } from 'sections/earn/text';

const StepTwo = () => {
	const { t } = useTranslation();

	return (
		<StepTwoContainer>
			<Heading>{t('dashboard.earn.withdraw-liquidity.title')}</Heading>
			<Description>{t('dashboard.earn.withdraw-liquidity.copy')}</Description>
			<a
				href="https://beta.arrakis.finance/vaults/10/0x56dEa47c40877c2aaC2a689aC56aa56cAE4938d2"
				target="_blank"
				rel="noreferrer"
			>
				<BigButton>{t('dashboard.earn.withdraw-liquidity.pool-link')}</BigButton>
			</a>
		</StepTwoContainer>
	);
};

const StepTwoContainer = styled.div`
	margin-top: 50px;
`;

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
	background-color: ${(props) => props.theme.colors.selectedTheme.surfaceFill};
	margin-bottom: 50px;
`;

export default StepTwo;
