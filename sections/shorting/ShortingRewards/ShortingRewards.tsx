import { FC, useMemo, useState, useEffect, useCallback, ReactNode } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import Notify from 'containers/Notify';
import Connector from 'containers/Connector';

import synthetix from 'lib/synthetix';
import Button from 'components/Button';
import { normalizeGasLimit, getTransactionPrice, gasPriceInWei } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { GridDivCentered } from 'styles/common';
import media from 'styles/media';

import { gasSpeedState, walletAddressState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCryptoCurrency } from 'utils/formatters/number';

import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { CurrencyKey } from 'constants/currency';

import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
} from 'sections/exchange/FooterCard/common';

import useCollateralShortRewards from 'queries/collateral/useCollateralShortRewards';

type ShortingRewardsProps = {
	currencyKey: CurrencyKey;
};

const ShortingRewards: FC<ShortingRewardsProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const { notify } = Connector.useContainer();
	const { monitorHash } = Notify.useContainer();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const collateralShortRewardsQuery = useCollateralShortRewards(currencyKey);
	const shortingRewards = collateralShortRewardsQuery.isSuccess
		? collateralShortRewardsQuery?.data ?? null
		: null;
	const [gasLimit, setGasLimit] = useState<number | null>(null);

	const submissionDisabledReason: ReactNode = useMemo(() => {
		if (isSubmitting) {
			return t('shorting.rewards.button.claiming');
		}
		if (shortingRewards == null || shortingRewards.lte(0)) {
			return t('shorting.rewards.button.claim');
		}
		return null;
	}, [shortingRewards, isSubmitting, t]);

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const getGasEstimate = useCallback(async () => {
		if (synthetix.js != null && walletAddress != null) {
			try {
				const gasLimitEstimate = await synthetix.js.contracts.CollateralShort.estimateGas.getReward(
					ethers.utils.formatBytes32String(currencyKey),
					walletAddress
				);
				return normalizeGasLimit(Number(gasLimitEstimate));
			} catch (e) {
				console.log('gas limit error:', e);
				return null;
			}
		}
		return null;
	}, [walletAddress, currencyKey]);

	useEffect(() => {
		async function getGasEstimateCall() {
			const newGasLimit = await getGasEstimate();
			setGasLimit(newGasLimit);
		}
		getGasEstimateCall();
	}, [getGasEstimate]);

	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);

	const gasPrice = ethGasPriceQuery?.data != null ? ethGasPriceQuery.data[gasSpeed] : null;
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const currencyPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, currencyKey, selectedPriceCurrency.name),
		[exchangeRates, currencyKey, selectedPriceCurrency.name]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, SYNTHS_MAP.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const onSubmit = async () => {
		if (synthetix.js != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;

				const gasLimitEstimate = await getGasEstimate();

				setGasLimit(gasLimitEstimate);

				tx = (await synthetix.js.contracts.CollateralShort.getReward(
					ethers.utils.formatBytes32String(currencyKey),
					walletAddress,
					{
						gasPrice: gasPriceInWei(gasPrice),
						gasLimit: gasLimitEstimate,
					}
				)) as ethers.ContractTransaction;

				if (tx != null && notify != null) {
					monitorHash({
						txHash: tx.hash,
						onTxConfirmed: () => {
							collateralShortRewardsQuery.refetch();
						},
					});
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const totalTradePrice = useMemo(() => {
		if (shortingRewards != null) {
			let tradePrice = shortingRewards.multipliedBy(currencyPriceRate);
			if (selectPriceCurrencyRate) {
				tradePrice = tradePrice.dividedBy(selectPriceCurrencyRate);
			}

			return tradePrice;
		}
		return 0;
	}, [shortingRewards, currencyPriceRate, selectPriceCurrencyRate]);

	return (
		<>
			<MessageContainer attached={false} className="footer-card">
				<SummaryItems attached={false}>
					<SummaryItem>
						<StyledSummaryItemLabel>{t('shorting.rewards.available')}</StyledSummaryItemLabel>
						<BoldSummaryItemValue>
							{formatCryptoCurrency(shortingRewards ?? 0, { currencyKey: CRYPTO_CURRENCY_MAP.SNX })}
						</BoldSummaryItemValue>
					</SummaryItem>
					<GasPriceSummaryItem gasPrices={gasPrices} transactionFee={transactionFee} />
				</SummaryItems>
				<Button
					variant="primary"
					isRounded={true}
					disabled={isSubmissionDisabled}
					onClick={onSubmit}
					size="lg"
					data-testid="claim-rewards"
				>
					{isSubmissionDisabled ? submissionDisabledReason : t('shorting.rewards.button.claim')}
				</Button>
			</MessageContainer>
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={onSubmit}
					baseCurrencyAmount={(shortingRewards ?? 0).toString()}
					feeAmountInBaseCurrency={null}
					baseCurrencyKey={currencyKey}
					totalTradePrice={totalTradePrice.toString()}
					txProvider="synthetix"
					baseCurrencyLabel={t('shorting.rewards.tx-confirm.claiming')}
				/>
			)}
		</>
	);
};

export const MessageContainer = styled(GridDivCentered)<{ attached?: boolean }>`
	border-radius: 4px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.navy};
	padding: 16px 32px;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: 1fr auto;
	`}
`;

const StyledSummaryItemLabel = styled(SummaryItemLabel)`
	color: ${(props) => props.theme.colors.silver};
`;

const BoldSummaryItemValue = styled(SummaryItemValue)`
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default ShortingRewards;
