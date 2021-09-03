import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Card from 'components/Card';
import Button from 'components/Button';

import { FlexDivRow, FlexDivRowCentered, GridDiv } from 'styles/common';

import Layer2Icon from 'assets/svg/app/layer-2.svg';

const Hero: FC = () => {
	const { t } = useTranslation();

	return (
		<StyledGrid>
			<StyledCard style={{ position: 'relative' }}>
				<BackgroundImage src={Layer2Icon} />
				<Card.Header noBorder={true}>
					<StyledHeaderText small={false}>{t('futures.hero.welcome.title')}</StyledHeaderText>
				</Card.Header>
				<Card.Body>
					<StyledBodySubtitle>{t('futures.hero.welcome.subtitle')}</StyledBodySubtitle>
					<StyledBodyText>{t('futures.hero.welcome.body')}</StyledBodyText>
					<ButtonContainer>
						<StyledTextButton variant="text" size="md" onClick={() => {}}>
							{t('futures.hero.welcome.button')}
						</StyledTextButton>
					</ButtonContainer>
				</Card.Body>
			</StyledCard>

			<StyledCard>
				<Card.Header noBorder={true}>
					<StyledHeaderText small={true}>{t('futures.hero.refer.title')}</StyledHeaderText>
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

const BackgroundImage = styled(Svg)`
	position: absolute;
	right: 18px;
	top: 28px;
`;

const StyledCard = styled(Card)`
	padding: 20px 0px;
`;

const StyledGrid = styled(GridDiv)`
	row-gap: 16px;
`;

const StyledHeaderText = styled.div<{ small: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: ${(props) => (props.small ? '14px' : '16px')};
	color: ${(props) => props.theme.colors.white};
	text-transform: none;
`;

const StyledBodyText = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: none;
`;

const StyledBodySubtitle = styled(StyledBodyText)`
	margin-bottom: 20px;
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
