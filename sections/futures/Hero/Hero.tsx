import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Card from 'components/Card';
import Button from 'components/Button';
import media from 'styles/media';

import { FlexDivRowCentered, GridDiv } from 'styles/common';

import Layer2Icon from 'assets/svg/app/layer-2.svg';
import CountdownTimer from '../CountdownTimer';

type Props = { displayReferBox?: boolean };
const Hero: FC<Props> = ({ displayReferBox = true }) => {
	const { t } = useTranslation();

	const endDate = Date.UTC(2021, 9, 26, 23, 59);

	return (
		<StyledGrid>
			<TopSection>
				<HeroCard>
					<BackgroundImageContainer>
						<BackgroundImage />
					</BackgroundImageContainer>
					<StyledHeaderText small={false}>{t('futures.hero.welcome.title')}</StyledHeaderText>
					<Card.Body>
						<StyledBodySubtitle>{t('futures.hero.welcome.subtitle')}</StyledBodySubtitle>
						<StyledBodyText>
							{t('futures.hero.welcome.body')}{' '}
							<a
								href={'https://blog.kwenta.io/futures-dashboards/'}
								target="_blank"
								rel="noreferrer"
							>
								{t('futures.hero.welcome.button')}
							</a>
						</StyledBodyText>
					</Card.Body>
				</HeroCard>
				<Spacer />
				<CountdownCard>
					<StyledHeaderText small={false}>{t('futures.hero.countdown.title')}</StyledHeaderText>
					<CountdownTimer endUtcTimestamp={endDate} />
				</CountdownCard>
			</TopSection>

			{displayReferBox && (
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
			)}
		</StyledGrid>
	);
};
export default Hero;

const TopSection = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: row;
	${media.lessThan('md')`
		flex-direction: column;
	`}
`;

const BackgroundImageContainer = styled.div`
	position: absolute;
	left: 0;
	top: 20px;
	right: 0;
	bottom: 0;
	text-align: center;
`;

const BackgroundImage = styled(Layer2Icon)`
	margin: 0 auto;
`;

const StyledCard = styled(Card)`
	padding: 20px 0px;
`;

const HeroCard = styled(StyledCard)`
	position: relative;
	text-align: center;
	padding: 35px 0 22px 0;
	flex: 1;
`;

const CountdownCard = styled(StyledCard)`
	text-align: center;
	padding: 35px 0;
`;

const StyledGrid = styled(GridDiv)`
	row-gap: 16px;
`;

const StyledHeaderText = styled.div<{ small: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: ${(props) => (props.small ? '14px' : '16px')};
	color: ${(props) => props.theme.colors.goldColors.color1};
	text-transform: none;
	text-align: center;
`;

const StyledBodyText = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: none;
	max-width: 500px;
	margin: 0 auto;
`;

const StyledBodySubtitle = styled(StyledBodyText)`
	font-family: ${(props) => props.theme.fonts.bold};
	margin-bottom: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const StyledCardRow = styled(FlexDivRowCentered)``;

const Spacer = styled.div`
	width: 16px;
	${media.lessThan('md')`
		height: 30px;
	`}
`;
