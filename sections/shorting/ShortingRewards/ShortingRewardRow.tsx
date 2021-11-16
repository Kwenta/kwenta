import { FC, useMemo, useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import TransactionNotifier from 'containers/TransactionNotifier';

import Button from 'components/Button';
import { normalizeGasLimit, gasPriceInWei } from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

import { walletAddressState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCryptoCurrency } from 'utils/formatters/number';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { CurrencyKey } from 'constants/currency';

import useCollateralShortRewards from 'queries/collateral/useCollateralShortRewards';
import Card from 'components/Card';
import Currency from 'components/Currency';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';

export type GasInfo = {
	limit: number;
	l1Fee: number;
};

type ShortingRewardRowProps = {
	currencyKey: CurrencyKey;
	gasPrice: number | null;
	setGasInfo: Dispatch<SetStateAction<GasInfo | null>>;
	snxPriceRate: number;
};

const ShortingRewardRow: FC<ShortingRewardRowProps> = ({
	currencyKey,
	gasPrice,
	setGasInfo,
	snxPriceRate,
}) => {
	const { t } = useTranslation();

	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthetixjs } = Connector.useContainer();

	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);

	const { selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const collateralShortRewardsQuery = useCollateralShortRewards(currencyKey);
	const getL1SecurityFee = useGetL1SecurityFee();

	const ShortingRewardRow = useMemo(
		() =>
			collateralShortRewardsQuery.isSuccess ? collateralShortRewardsQuery?.data ?? null : null,
		[collateralShortRewardsQuery.isSuccess, collateralShortRewardsQuery.data]
	);

	const submissionDisabledReason = useMemo(() => {
		if (isSubmitting) {
			return t('shorting.rewards.button.claiming');
		}
		if (ShortingRewardRow == null || ShortingRewardRow.lte(0)) {
			return t('shorting.rewards.button.claim');
		}
		return null;
	}, [ShortingRewardRow, isSubmitting, t]);

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const totalTradePrice = useMemo(() => {
		if (ShortingRewardRow != null) {
			let tradePrice = ShortingRewardRow.mul(snxPriceRate);
			if (selectPriceCurrencyRate) {
				tradePrice = tradePrice.div(selectPriceCurrencyRate);
			}

			return tradePrice;
		}
		return 0;
	}, [ShortingRewardRow, snxPriceRate, selectPriceCurrencyRate]);

	const getGasEstimate = useCallback(async () => {
		if (synthetixjs != null && walletAddress != null && gasPrice != null) {
			try {
				const { CollateralShort } = synthetixjs.contracts;

				const params = [ethers.utils.formatBytes32String(currencyKey), walletAddress];

				const gasLimitEstimate = await CollateralShort.estimateGas.getReward(...params);
				const limit = normalizeGasLimit(Number(gasLimitEstimate));

				const metaTx = await CollateralShort.populateTransaction.getReward(...params);
				const gasPriceWei = gasPriceInWei(gasPrice);

				const l1Fee = await getL1SecurityFee({
					...metaTx,
					gasPrice: gasPriceWei,
					gasLimit: limit,
				});

				return { limit, l1Fee };
			} catch (e) {
				console.log('gas limit error:', e);
				return null;
			}
		}
		return null;
	}, [walletAddress, currencyKey, synthetixjs, gasPrice, getL1SecurityFee]);

	useEffect(() => {
		async function getGasEstimateCall() {
			const gasInfo = await getGasEstimate();
			setGasInfo(gasInfo);
		}
		getGasEstimateCall();
	}, [getGasEstimate, setGasInfo, gasPrice]);

	const handleSubmit = useCallback(async () => {
		if (synthetixjs != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;
				const { CollateralShort } = synthetixjs!.contracts;

				const gasEstimate = await getGasEstimate();

				setGasInfo(gasEstimate);

				tx = (await CollateralShort.getReward(
					ethers.utils.formatBytes32String(currencyKey),
					walletAddress,
					{
						gasPrice: gasPriceInWei(gasPrice),
						gasLimit: gasEstimate?.limit,
					}
				)) as ethers.ContractTransaction;

				if (tx != null) {
					monitorTransaction({
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
	}, [
		collateralShortRewardsQuery,
		currencyKey,
		gasPrice,
		getGasEstimate,
		monitorTransaction,
		setGasInfo,
		walletAddress,
		synthetixjs,
	]);

	return (
		<StyledCard>
			<StyledCardBody>
				<FlexDivRowCentered>
					<RewardsAmountContainer>
						<Currency.Icon currencyKey={currencyKey} />
						<RewardsAmount>
							{formatCryptoCurrency(ShortingRewardRow ?? 0, {
								currencyKey: CRYPTO_CURRENCY_MAP.SNX,
							})}
						</RewardsAmount>
					</RewardsAmountContainer>
					<Button
						variant="primary"
						isRounded={true}
						disabled={isSubmissionDisabled}
						onClick={handleSubmit}
						size="sm"
						data-testid="claim-rewards"
					>
						{isSubmissionDisabled ? submissionDisabledReason : t('shorting.rewards.button.claim')}
					</Button>
				</FlexDivRowCentered>
			</StyledCardBody>
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={(ShortingRewardRow ?? 0).toString()}
					baseCurrencyKey={CRYPTO_CURRENCY_MAP.SNX}
					totalTradePrice={totalTradePrice.toString()}
					feeCost={wei(0)}
					txProvider="synthetix"
					baseCurrencyLabel={t('shorting.rewards.tx-confirm.claiming')}
				/>
			)}
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	margin-bottom: 16px;
`;

const StyledCardBody = styled(Card.Body)`
	padding: 4px ​12px;
	background: ${(props) => props.theme.colors.navy};
`;

const RewardsAmount = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 10px;
`;

const RewardsAmountContainer = styled(FlexDivCentered)`
	color: ${(props) => props.theme.colors.white};
`;

export default ShortingRewardRow;
