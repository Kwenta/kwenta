import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Card from 'components/Card';
import Button from 'components/Button';

import { FlexDivRow, FlexDivRowCentered, GridDiv } from 'styles/common';

type HeroProps = {};

const Hero: React.FC<HeroProps> = ({}) => {
	const { t } = useTranslation();

	return (
		<StyledGrid>
			<StyledCard>
				<Card.Header>
					<StyledHeaderText>{t('futures.hero.welcome.title')}</StyledHeaderText>
				</Card.Header>
				<Card.Body>
					<StyledBodyText>{t('futures.hero.welcome.body')}</StyledBodyText>
					<ButtonContainer>
						<StyledTextButton variant="text" size="md" onClick={() => {}}>
							{t('futures.hero.welcome.button')}
						</StyledTextButton>
					</ButtonContainer>
				</Card.Body>
			</StyledCard>

			<StyledCard>
				<Card.Header>
					<StyledHeaderText>{t('futures.hero.refer.title')}</StyledHeaderText>
				</Card.Header>
				<Card.Body>
					<StyledCardRow>
						<StyledBodyText>{t('futures.hero.refer.body')}</StyledBodyText>
						<Button variant="primary" isRounded size="lg" onClick={() => {}}>
							{t('futures.hero.refer.button')}
						</Button>
					</StyledCardRow>
				</Card.Body>
			</StyledCard>
		</StyledGrid>
	);
};
export default Hero;

const StyledCard = styled(Card)`
	padding: 20px 0px;
`;

const StyledGrid = styled(GridDiv)`
	row-gap: 16px;
`;

const StyledHeaderText = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const StyledBodyText = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: capitalize;
`;

const StyledCardRow = styled(FlexDivRowCentered)``;

const ButtonContainer = styled(FlexDivRow)`
	width: 100%;
	margin: 8px 0px;
`;

const StyledTextButton = styled(Button)`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.goldColors.color1};
	text-transform: uppercase;

	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;
