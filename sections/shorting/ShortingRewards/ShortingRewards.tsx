import { FC, useMemo, useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';
import { ethers } from 'ethers';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import {} from 'styles/common';
import Card from 'components/Card';
import synthetix from 'lib/synthetix';
import Button from 'components/Button';
import { normalizeGasLimit, getTransactionPrice, gasPriceInWei } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import InfoIcon from 'assets/svg/app/info.svg';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import ArrowRightIcon from 'assets/svg/app/circle-arrow-right.svg';
import { GAS_SPEEDS } from 'queries/network/useEthGasPriceQuery';
import { FixedFooterMixin, GridDivCentered, NumericValue } from 'styles/common';
import media from 'styles/media';
import { gasSpeedState, customGasPriceState, walletAddressState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatCryptoCurrency } from 'utils/formatters/number';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import { SYNTHS_MAP } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useCollateralShortDataQuery from 'queries/collateral/useCollateralShortDataQuery';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE, ESTIMATE_VALUE } from 'constants/placeholder';
import Notify from 'containers/Notify';
import Connector from 'containers/Connector';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
	GasPriceCostTooltip,
	GasPriceItem,
	GasPriceTooltip,
	StyledGasButton,
	CustomGasPrice,
	GasSelectContainer,
	CustomGasPriceContainer,
	MobileCard,
	StyledGasEditButton,
} from 'sections/exchange/FooterCard/TradeSummaryCard';
import { SubmissionDisabledReason } from 'sections/exchange/FooterCard/common';

interface ShortingRewardsProps {
	synth: CurrencyKey;
}

const ShortingRewards: FC<ShortingRewardsProps> = ({ synth }) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
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

	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? null, [ethGasPriceQuery.data]);

	const hasCustomGasPrice = customGasPrice !== '';
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

	const gasPriceItem = hasCustomGasPrice ? (
		<span data-testid="gas-price">{Number(customGasPrice)}</span>
	) : (
		<span data-testid="gas-price">
			{ESTIMATE_VALUE} {gasPrice}
		</span>
	);

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

	const summaryItems = (
		<SummaryItems attached={false}>
			<SummaryItem>
				<SummaryItemLabel>{t('shorting.rewards.available')}</SummaryItemLabel>
				<SummaryItemValue>
					{formatCryptoCurrency(shortingRewards ?? 0, { currencyKey: synth })}
				</SummaryItemValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryItemLabel>{t('exchange.summary-info.gas-price-gwei')}</SummaryItemLabel>
				<SummaryItemValue>
					{gasPrice != null ? (
						<>
							{transactionFee != null ? (
								<GasPriceCostTooltip
									content={
										<span>
											{formatCurrency(selectedPriceCurrency.name, transactionFee, {
												sign: selectedPriceCurrency.sign,
											})}
										</span>
									}
									arrow={false}
								>
									<GasPriceItem>
										{gasPriceItem}
										<Svg src={InfoIcon} />
									</GasPriceItem>
								</GasPriceCostTooltip>
							) : (
								gasPriceItem
							)}
							<GasPriceTooltip
								trigger="click"
								arrow={false}
								content={
									<GasSelectContainer>
										<CustomGasPriceContainer>
											<CustomGasPrice
												value={customGasPrice}
												onChange={(_, value) => setCustomGasPrice(value)}
												placeholder={t('common.custom')}
											/>
										</CustomGasPriceContainer>
										{GAS_SPEEDS.map((speed) => (
											<StyledGasButton
												key={speed}
												variant="select"
												onClick={() => {
													setCustomGasPrice('');
													setGasSpeed(speed);
												}}
												isActive={hasCustomGasPrice ? false : gasSpeed === speed}
											>
												<span>{t(`common.gas-prices.${speed}`)}</span>
												<NumericValue>{gasPrices![speed]}</NumericValue>
											</StyledGasButton>
										))}
									</GasSelectContainer>
								}
								interactive={true}
							>
								<StyledGasEditButton role="button">{t('common.edit')}</StyledGasEditButton>
							</GasPriceTooltip>
						</>
					) : (
						NO_VALUE
					)}
				</SummaryItemValue>
			</SummaryItem>
		</SummaryItems>
	);

	return (
		<>
			<MobileOrTabletView>
				<MobileCard className="trade-summary-card">
					<Card.Body>{summaryItems}</Card.Body>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer attached={false} className="footer-card">
				<DesktopOnlyView>{summaryItems}</DesktopOnlyView>
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
	width: 48%;
	border-radius: 4px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	${(props) =>
		props.attached &&
		css`
			border-radius: 4px;
		`}
	${media.lessThan('md')`
		${FixedFooterMixin};
		box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
		justify-content: center;
		display: flex;
	`}
`;

export default ShortingRewards;
