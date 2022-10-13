import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { setOpenModal } from 'state/exchange/reducer';
import { selectNoSynths, selectTotalRedeemableBalanceWei } from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/store';

import Button from 'components/Button';
import Connector from 'containers/Connector';
// import { useExchangeContext } from 'contexts/ExchangeContext';
import useApproveExchange from 'hooks/useApproveExchange';
import useExchange from 'hooks/useExchange';
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

	const { showNoSynthsCard, handleSubmit, handleDismiss, submissionDisabledReason } = useExchange({
		showNoSynthsCard: false,
	});

	const dispatch = useAppDispatch();

	const {
		quoteCurrencyKey,
		baseCurrencyKey,
		needsApproval,
		redeemableSynthBalances,
		numEntries,
		feeReclaimPeriod,
		openModal,
	} = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		needsApproval: exchange.needsApproval,
		redeemableSynthBalances: exchange.redeemableSynthBalances,
		numEntries: exchange.numEntries,
		feeReclaimPeriod: exchange.feeReclaimPeriod,
		openModal: exchange.openModal,
	}));

	const totalRedeemableBalance = useAppSelector(selectTotalRedeemableBalanceWei);

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
				<SettleTransactionsCard />
			) : (
				<TradeSummaryCard
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={needsApproval ? (isApproved ? handleSubmit : handleApprove) : handleSubmit}
					feeReclaimPeriodInSeconds={feeReclaimPeriod}
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
			{openModal === 'confirm' && <TxConfirmationModal attemptRetry={handleSubmit} />}
			{openModal === 'approve' && (
				<TxApproveModal
					onDismiss={() => dispatch(setOpenModal(undefined))}
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
