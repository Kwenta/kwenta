import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { selectNoSynths } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useExchangeContext } from 'contexts/ExchangeContext';
import useApproveExchange from 'hooks/useApproveExchange';
import useIsL2 from 'hooks/useIsL2';
import useMarketClosed from 'hooks/useMarketClosed';
import useRedeem from 'hooks/useRedeem';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { txErrorState } from 'store/exchange';
import { NoTextTransform } from 'styles/common';

import SettleTransactionsCard from '../../FooterCard/SettleTransactionsCard';

const FooterCard: FC = memo(() => {
	const { t } = useTranslation();
	const { isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();

	const txError = useRecoilValue(txErrorState);

	const {
		showNoSynthsCard,
		handleSubmit,
		openModal,
		setOpenModal,
		handleDismiss,
		submissionDisabledReason,
		feeReclaimPeriodInSeconds,
	} = useExchangeContext();

	const {
		quoteCurrencyKey,
		baseCurrencyKey,
		needsApproval,
		redeemableSynthBalances,
		totalRedeemableBalance,
		numEntries,
		estimatedBaseTradePrice,
	} = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		needsApproval: exchange.needsApproval,
		redeemableSynthBalances: exchange.redeemableSynthBalances,
		totalRedeemableBalance: exchange.totalRedeemableBalance,
		numEntries: exchange.numEntries,
		estimatedBaseTradePrice: exchange.estimatedBaseTradePrice,
	}));

	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey ?? null);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey ?? null);

	const noSynths = useAppSelector(selectNoSynths);

	const { handleApprove, isApproved } = useApproveExchange();
	const { handleRedeem } = useRedeem();

	return (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard />
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard />
			) : showNoSynthsCard && noSynths ? (
				<NoSynthsCard />
			) : !isL2 && numEntries >= 12 ? (
				<SettleTransactionsCard numEntries={numEntries} />
			) : (
				<TradeSummaryCard
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={needsApproval ? (isApproved ? handleSubmit : handleApprove) : handleSubmit}
					feeReclaimPeriodInSeconds={feeReclaimPeriodInSeconds}
					isApproved={needsApproval ? isApproved : undefined}
				/>
			)}
			{redeemableSynthBalances.length !== 0 && totalRedeemableBalance.gt(0) && (
				<Button
					variant="primary"
					disabled={false}
					onClick={handleRedeem}
					size="lg"
					data-testid="submit-order"
					fullWidth
				>
					{t('dashboard.deprecated.button.redeem-synths')}
				</Button>
			)}
			{openModal === 'redeem' && (
				<RedeemTxModal {...{ txError }} onDismiss={handleDismiss} attemptRetry={handleRedeem} />
			)}
			{openModal === 'confirm' && (
				<TxConfirmationModal
					onDismiss={() => setOpenModal(undefined)}
					txError={txError}
					attemptRetry={handleSubmit}
					totalTradePrice={estimatedBaseTradePrice.toString()}
					quoteCurrencyLabel={t('exchange.common.from')}
					baseCurrencyLabel={t('exchange.common.into')}
					icon={<ArrowsIcon />}
				/>
			)}
			{openModal === 'approve' && (
				<TxApproveModal
					onDismiss={() => setOpenModal(undefined)}
					txError={txError}
					attemptRetry={handleApprove}
					currencyKey={quoteCurrencyKey!}
					currencyLabel={<NoTextTransform>{quoteCurrencyKey}</NoTextTransform>}
				/>
			)}
		</>
	);
});

export default FooterCard;
