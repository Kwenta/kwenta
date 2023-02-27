import { useConnectModal } from '@rainbow-me/rainbowkit';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import SwitchAssetArrows from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import Button from 'components/Button';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { NumberDiv } from 'components/Text/NumberLabel';
import { EXTERNAL_LINKS } from 'constants/links';
import { setOpenModal } from 'state/app/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectFuturesType,
	selectHasRemainingMargin,
	selectPosition,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';
import { BorderedPanel, YellowIconButton, PillButtonSpan } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';

const ConnectDepositButton = memo(() => {
	const { t } = useTranslation();
	const { openConnectModal } = useConnectModal();

	return (
		<DepositButton onClick={openConnectModal}>
			<ButtonContent>{t('common.wallet.connect-wallet')}</ButtonContent>
		</DepositButton>
	);
});

const DepositMarginButton = memo(() => {
	const dispatch = useAppDispatch();
	const accountType = useAppSelector(selectFuturesType);

	const handleOpenModal = useCallback(() => {
		dispatch(
			setOpenModal(
				accountType === 'isolated_margin' ? 'futures_isolated_transfer' : 'futures_cross_deposit'
			)
		);
	}, [dispatch, accountType]);

	return (
		<DepositButton onClick={handleOpenModal}>
			<ButtonContent>
				Deposit Margin <SwitchAssetArrows />
			</ButtonContent>
		</DepositButton>
	);
});

export default function TradePanelHeader() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const hasMargin = useAppSelector(selectHasRemainingMargin);
	const wallet = useAppSelector(selectWallet);
	const accountType = useAppSelector(selectFuturesType);

	const balance =
		accountType === 'isolated_margin' ? position?.remainingMargin ?? zeroBN : freeMargin;

	const onPressDeposit = () => {
		accountType === 'isolated_margin'
			? dispatch(setOpenModal('futures_isolated_transfer'))
			: dispatch(setOpenModal('futures_cross_deposit'));
	};

	if (!wallet) {
		return <ConnectDepositButton />;
	}

	if (!hasMargin) {
		return <DepositMarginButton />;
	}

	return (
		<Container>
			<Title>
				<StyledFuturesIcon type={accountType} />
				{t(
					`futures.market.trade.${
						accountType === 'cross_margin' ? 'cross' : 'isolated'
					}-margin.title`
				)}
				{accountType === 'cross_margin' && (
					<FAQLink onClick={() => window.open(EXTERNAL_LINKS.Docs.CrossMarginFaq)}>
						<HelpIcon />
					</FAQLink>
				)}
			</Title>
			<BalanceRow onClick={onPressDeposit}>
				<NumberDiv contrast="strong">{formatDollars(balance ?? zeroBN)}</NumberDiv>
				<BalanceButton>
					<StyledPillButtonSpan>
						<SwitchAssetArrows />
					</StyledPillButtonSpan>
				</BalanceButton>
			</BalanceRow>
		</Container>
	);
}

const StyledPillButtonSpan = styled(PillButtonSpan)`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 20px;
	width: 20px;
	margin-left: 0;
`;

const DepositButton = styled(Button).attrs({ fullWidth: true, variant: 'yellow' })`
	height: 55px;
	margin-bottom: 16px;

	svg {
		fill: ${(props) => props.theme.colors.selectedTheme.button.yellow.text};
	}
`;

const Container = styled(BorderedPanel)`
	display: flex;
	justify-content: space-between;
	padding: 10px 12px;
	margin-bottom: 16px;
	height: 55px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	align-items: center;
	cursor: default;
`;

const StyledFuturesIcon = styled(FuturesIcon)`
	margin-right: 6px;
`;

const BalanceRow = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const BalanceButton = styled(YellowIconButton)`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const FAQLink = styled.div`
	&:hover {
		opacity: 0.5;
	}
	cursor: pointer;
	margin-left: 5px;
`;

const ButtonContent = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 10px;
`;
