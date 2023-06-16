import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AlertIcon from 'assets/svg/app/alert.svg';
import Button from 'components/Button';
import { FlexDivColCentered } from 'components/layout/flex';
import { BANNER_LINK_URL } from 'constants/announcement';
import ROUTES from 'constants/routes';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

type Props = {
	onDismiss: () => void;
};

const SwitchToSmartMargin: React.FC<Props> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const currentMarket = useAppSelector(selectMarketAsset);

	const switchToSM = useCallback(() => {
		router.push(ROUTES.Markets.MarketPair(currentMarket, 'cross_margin'));
	}, [currentMarket, router]);

	return (
		<MessageContainer>
			<Title>
				<AlertIcon />
			</Title>
			<UnsupportedMessage>
				{t('futures.cta-buttons.copy')}
				<StyledLink href={BANNER_LINK_URL} target="_blank" rel="noreferrer">
					{t('futures.cta-buttons.learn-more')}
				</StyledLink>
			</UnsupportedMessage>
			<ButtonContainer>
				<Button variant="yellow" onClick={switchToSM}>
					{t('futures.cta-buttons.switch-to-smart-margin')}
				</Button>
				<StyledLink onClick={onDismiss}>{t('futures.cta-buttons.dismiss')}</StyledLink>
			</ButtonContainer>
		</MessageContainer>
	);
};

const StyledLink = styled.a`
	text-decoration: underline;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	font-size: 15px;
	cursor: pointer;
`;

const UnsupportedMessage = styled.div`
	margin-top: 26.25px;
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	margin-bottom: 45px;
	line-height: 18px;
`;

const ButtonContainer = styled(FlexDivColCentered)`
	width: 100%;
	justify-content: center;
	row-gap: 17.5px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const MessageContainer = styled.div`
	margin-top: 51.25px;
	padding: 0 40px;
	text-align: center;
`;

export default SwitchToSmartMargin;
