import { useExchangeContext } from 'contexts/ExchangeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';
import Button from 'components/Button';
import useMarketClosed from 'hooks/useMarketClosed';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import {
	baseCurrencyAmountState,
	baseCurrencyKeyState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	txErrorState,
} from 'store/exchange';
import { isL2State, isWalletConnectedState } from 'store/wallet';
import { NoTextTransform } from 'styles/common';

import SettleTransactionsCard from '../../FooterCard/SettleTransactionsCard';

const FooterCard: React.FC = () => {
	const { t } = useTranslation();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const txError = useRecoilValue(txErrorState);

	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey);

	const {
		noSynths,
		numEntries,
		footerCardAttached,
		showNoSynthsCard,
		baseFeeRate,
		handleSettle,
		needsApproval,
		baseCurrency,
		handleApprove,
		isApproved,
		handleSubmit,
		handleRedeem,
		balances,
		txProvider,
		openModal,
		basePriceRate,
		transactionFee,
		totalUSDBalance,
		setOpenModal,
		handleDismiss,
		feeCost,
		exchangeFeeRate,
		estimatedBaseTradePrice,
		settlementWaitingPeriodInSeconds,
		submissionDisabledReason,
		feeReclaimPeriodInSeconds,
		totalTradePrice,
	} = useExchangeContext();

	return (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={footerCardAttached} />
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard
					baseCurrencyMarketClosed={baseCurrencyMarketClosed}
					quoteCurrencyMarketClosed={quoteCurrencyMarketClosed}
					attached={footerCardAttached}
				/>
			) : showNoSynthsCard && noSynths ? (
				<NoSynthsCard attached={footerCardAttached} />
			) : !isL2 && numEntries >= 12 ? (
				<SettleTransactionsCard
					attached={footerCardAttached}
					settlementWaitingPeriodInSeconds={settlementWaitingPeriodInSeconds}
					onSubmit={handleSettle}
					settleCurrency={baseCurrencyKey}
					numEntries={numEntries}
				/>
			) : (
				<TradeSummaryCard
					attached={footerCardAttached}
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={needsApproval ? (isApproved ? handleSubmit : handleApprove) : handleSubmit}
					totalTradePrice={baseCurrencyAmount ? totalTradePrice.toString() : null}
					baseCurrencyAmount={baseCurrencyAmount}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency}
					feeReclaimPeriodInSeconds={feeReclaimPeriodInSeconds}
					quoteCurrencyKey={quoteCurrencyKey}
					totalFeeRate={exchangeFeeRate}
					baseFeeRate={baseFeeRate}
					transactionFee={transactionFee}
					feeCost={feeCost}
					showFee={txProvider === 'synthetix'}
					isApproved={needsApproval ? isApproved : undefined}
				/>
			)}
			{balances.length !== 0 && totalUSDBalance.gt(0) && (
				<Button
					variant="primary"
					isRounded
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
				<RedeemTxModal
					{...{ txError, balances, totalUSDBalance }}
					onDismiss={handleDismiss}
					attemptRetry={handleRedeem}
				/>
			)}
			{openModal === 'confirm' && (
				<TxConfirmationModal
					onDismiss={() => setOpenModal(undefined)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={baseCurrencyAmount}
					quoteCurrencyAmount={quoteCurrencyAmount}
					feeCost={txProvider === 'synthetix' ? feeCost : null}
					baseCurrencyKey={baseCurrencyKey!}
					quoteCurrencyKey={quoteCurrencyKey!}
					totalTradePrice={estimatedBaseTradePrice.toString()}
					txProvider={txProvider}
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
					txProvider={txProvider}
				/>
			)}
			{openModal === 'settle' && (
				<TxSettleModal
					onDismiss={() => setOpenModal(undefined)}
					txError={txError}
					attemptRetry={handleSettle}
					currencyKey={baseCurrencyKey!}
					currencyLabel={<NoTextTransform>{baseCurrencyKey}</NoTextTransform>}
					txProvider={txProvider}
				/>
			)}
		</>
	);
};

export default FooterCard;
