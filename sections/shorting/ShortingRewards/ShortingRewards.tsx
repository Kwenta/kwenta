import { FC, useMemo, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';
import { ethers } from 'ethers';

import Notify from 'containers/Notify';
import Connector from 'containers/Connector';

import synthetix from 'lib/synthetix';
import Button from 'components/Button';
import { normalizeGasLimit, getTransactionPrice, gasPriceInWei } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import ArrowRightIcon from 'assets/svg/app/circle-arrow-right.svg';

import { GridDivCentered } from 'styles/common';
import media from 'styles/media';

import { gasSpeedState, walletAddressState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCryptoCurrency } from 'utils/formatters/number';

import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useCollateralShortDataQuery from 'queries/collateral/useCollateralShortDataQuery';

import { SYNTHS_MAP } from 'constants/currency';
import { CurrencyKey } from 'constants/currency';

import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
} from 'sections/exchange/FooterCard/common';

import { SubmissionDisabledReason } from 'sections/exchange/FooterCard/common';

type ShortingRewardsProps = {
	synth: CurrencyKey;
};

const ShortingRewards: FC<ShortingRewardsProps> = ({ synth }) => {
	const { t } = useTranslation();
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const { notify } = Connector.useContainer();
	const { monitorHash } = Notify.useContainer();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const collateralShortDataQuery = useCollateralShortDataQuery(synth);
	const shortingRewards = collateralShortDataQuery.isSuccess
		? collateralShortDataQuery?.data?.shortingRewards ?? null
		: null;

	const [gasLimit, setGasLimit] = useState<number | null>(null);

	const submissionDisabledReason: SubmissionDisabledReason | null = useMemo(() => {
		if (isSubmitting) {
			return 'submitting';
		}
		if (shortingRewards == null || shortingRewards.lte(0)) {
			return 'claim';
		}
		return null;
	}, [shortingRewards, isSubmitting]);

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const getGasEstimate = useCallback(async () => {
		if (synthetix.js != null && walletAddress != null) {
			try {
				const gasLimitEstimate = await synthetix.js.contracts.CollateralShort.estimateGas.getReward(
					synthetix.js?.toBytes32(synth),
					walletAddress
				);
				return normalizeGasLimit(Number(gasLimitEstimate));
			} catch (e) {
				console.log('gas limit error:', e);
				return null;
			}
		}
		return null;
	}, [walletAddress, synth]);

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

				const gasPriceWei = gasPriceInWei(gasPrice);

				const gasLimitEstimate = await getGasEstimate();

				setGasLimit(gasLimitEstimate);

				tx = (await synthetix.js.contracts.CollateralShort.open(
					synthetix.js?.toBytes32(synth),
					walletAddress,
					{
						gasPrice: gasPriceWei,
						gasLimit: gasLimitEstimate,
					}
				)) as ethers.ContractTransaction;

				if (tx != null && notify != null) {
					monitorHash({
						txHash: tx.hash,
						onTxConfirmed: () => {
							collateralShortDataQuery.refetch();
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

	return (
		<>
			<MessageContainer attached={false} className="footer-card">
				<SummaryItems attached={false}>
					<SummaryItem>
						<StyledSummaryItemLabel>{t('shorting.rewards.available')}</StyledSummaryItemLabel>
						<BoldSummaryItemValue>
							{formatCryptoCurrency(shortingRewards ?? 0, { currencyKey: synth })}
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
					data-testid="submit-order"
				>
					{isSubmissionDisabled
						? t(`shorting.rewards.button.${submissionDisabledReason}`)
						: t('shorting.rewards.button.claim')}
				</Button>
			</MessageContainer>
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={onSubmit}
					baseCurrencyAmount={(shortingRewards ?? 0).toString()}
					quoteCurrencyAmount={'0'}
					feeAmountInBaseCurrency={null}
					baseCurrencyKey={synth}
					quoteCurrencyKey={synth}
					totalTradePrice={'0'}
					txProvider="synthetix"
					quoteCurrencyLabel={t('shorting.common.posting')}
					baseCurrencyLabel={t('shorting.common.shorting')}
					icon={<Svg src={ArrowRightIcon} />}
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
