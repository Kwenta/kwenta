import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BalancerImage from 'assets/svg/providers/balancer.svg';
import ArrowsIcon from 'assets/svg/app/arrows.svg';
import useBalancerExchange from 'sections/exchange/hooks/useBalancerExchange';
import { SwapCurrenciesButton, FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';

import { CenteredModal } from '../common';

type BalancerTradeModalProps = {
	onDismiss: () => void;
};

const BalancerTradeModal: FC<BalancerTradeModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	const {
		quoteCurrencyCard,
		baseCurrencyCard,
		handleCurrencySwap,
		footerCard,
	} = useBalancerExchange({
		footerCardAttached: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: true,
	});

	return (
		<StyledCenteredModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.afterHours.title')}
			lowercase={true}
		>
			<NoticeText>{t('modals.afterHours.notice-text')}</NoticeText>
			{quoteCurrencyCard}
			<VerticalSpacer>
				<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
					<ArrowsIcon />
				</SwapCurrenciesButton>
			</VerticalSpacer>
			{baseCurrencyCard}
			{footerCard}
			<PoweredBySection>
				<div>{t('modals.afterHours.powered-by-balancer')}</div>
				<PaddedImg alt={t('common.dex-aggregators.balancer.title')} width="20px" height="25px" />
			</PoweredBySection>
		</StyledCenteredModal>
	);
};

const StyledCenteredModal = styled(CenteredModal)`
	.currency-card {
		width: 312px;
		${media.lessThan('md')`
	width: 100%;
	`}
	}
	.card {
		background-color: ${(props) => props.theme.colors.vampire};
		width: 400px;
		margin: 0 auto;
		padding: 0 20px;
	}
`;

const VerticalSpacer = styled.div`
	height: 2px;
	position: relative;
	margin: 0 auto;
	${SwapCurrenciesButton} {
		position: absolute;
		transform: translate(-50%, -50%) rotate(90deg);
		border: 2px solid ${(props) => props.theme.colors.black};
	}
`;

const NoticeText = styled.div`
	color: ${(props) => props.theme.colors.silver};
	text-align: center;
	padding: 15px 20px 10px 20px;
	text-align: justify;
`;

const PoweredBySection = styled(FlexDivRowCentered)`
	margin: 15px auto;
	text-align: center;
	color: ${(props) => props.theme.colors.silver};
	width: 150px;
`;

const PaddedImg = styled(BalancerImage)`
	margin-left: 8px;
`;

export default BalancerTradeModal;
