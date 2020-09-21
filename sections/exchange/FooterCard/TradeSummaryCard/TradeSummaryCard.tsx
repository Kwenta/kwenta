import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ethers } from 'ethers';
import styled from 'styled-components';
import get from 'lodash/get';
import Tippy from '@tippyjs/react';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { useRecoilState } from 'recoil';

import synthetix, { Synth } from 'lib/synthetix';

import { GasPrices, GAS_SPEEDS } from 'queries/network/useGasStationQuery';

import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey } from 'constants/currency';

import { secondsToTime } from 'utils/formatters/date';

import Button from 'components/Button';
import { DesktopOnlyView } from 'components/Media';
import NumericInput from 'components/Input/NumericInput';

import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { NoTextTransform, numericValueCSS, NumericValue } from 'styles/common';

import { MessageContainer } from '../common';

type TradeSummaryCardProps = {
	selectedPriceCurrency: Synth;
	isSubmissionDisabled: boolean;
	isSubmitting: boolean;
	baseCurrencyAmount: string;
	onSubmit: () => void;
	totalTradePrice: number;
	basePriceRate: number;
	baseCurrency: Synth | null;
	insufficientBalance: boolean;
	selectedBothSides: boolean;
	isBaseCurrencyFrozen: boolean;
	isQuoteCurrencySuspended: boolean;
	isBaseCurrencySuspended: boolean;
	gasPrices: GasPrices | undefined;
	feeReclaimPeriodInSeconds: number;
	quoteCurrencyKey: CurrencyKey | null;
};

const TradeSummaryCard: FC<TradeSummaryCardProps> = ({
	selectedPriceCurrency,
	isSubmissionDisabled,
	isSubmitting,
	baseCurrencyAmount,
	onSubmit,
	totalTradePrice,
	basePriceRate,
	baseCurrency,
	insufficientBalance,
	selectedBothSides,
	isBaseCurrencyFrozen,
	isQuoteCurrencySuspended,
	isBaseCurrencySuspended,
	gasPrices,
	feeReclaimPeriodInSeconds,
	quoteCurrencyKey,
}) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? gasPrices[gasSpeed] : null;

	const exchangeFeeRateRaw: string | null =
		baseCurrency != null
			? get(synthetix.js, ['defaults', 'EXCHANGE_FEE_RATES', baseCurrency.category], null)
			: null;

	const exchangeFeeRate =
		exchangeFeeRateRaw != null ? Number(ethers.utils.formatEther(exchangeFeeRateRaw)) : null;

	function getButtonLabel() {
		if (isSubmissionDisabled) {
			// figure out the reason
			if (feeReclaimPeriodInSeconds) {
				return t('exchange.summary-info.button.fee-reclaim-period');
			}
			if (isQuoteCurrencySuspended || isBaseCurrencySuspended) {
				// TODO: use the reason code to determine the real cause, for now just use market closure
				return t('exchange.summary-info.button.market-is-closed');
			}
			if (isBaseCurrencyFrozen) {
				return t('exchange.summary-info.button.synth-is-frozen');
			}
			if (isBaseCurrencyFrozen) {
				return t('exchange.summary-info.button.synth-is-frozen');
			}
			if (!selectedBothSides) {
				return t('exchange.summary-info.button.select-synth');
			}
			if (insufficientBalance) {
				return t('exchange.summary-info.button.insufficient-balance');
			}
			if (isSubmitting) {
				return t('exchange.summary-info.button.submitting-order');
			}
			return t('exchange.summary-info.button.enter-amount');
		}
		return t('exchange.summary-info.button.submit-order');
	}
	return (
		<MessageContainer>
			<DesktopOnlyView>
				<SummaryItems>
					<SummaryItem>
						<SummaryItemLabel>{t('exchange.summary-info.gas-price')}</SummaryItemLabel>
						<SummaryItemValue>
							{gasPrice != null ? (
								<>
									{t('exchange.summary-info.price-in-gwei', {
										price: hasCustomGasPrice ? Number(customGasPrice) : gasPrice,
									})}
									<GasPriceTooltip
										trigger="click"
										arrow={false}
										content={
											<>
												<CustomGasPrice
													value={customGasPrice}
													onChange={(e) => setCustomGasPrice(e.target.value)}
													placeholder="Custom"
												/>
												{GAS_SPEEDS.map((speed) => (
													<GasSpeedButtonContainer key={speed}>
														<Button
															variant="secondary"
															onClick={() => {
																setCustomGasPrice('');
																setGasSpeed(speed);
															}}
															isActive={hasCustomGasPrice ? false : gasSpeed === speed}
														>
															<span>{t(`common.gas-prices.${speed}`)}</span>
															<NumericValue>{gasPrices![speed]}</NumericValue>
														</Button>
													</GasSpeedButtonContainer>
												))}
											</>
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
					<SummaryItem>
						<SummaryItemLabel>
							<Trans
								i18nKey="common.currency.currency-value"
								values={{ currencyKey: selectedPriceCurrency.asset }}
								components={[<NoTextTransform />]}
							/>
						</SummaryItemLabel>
						<SummaryItemValue>
							{baseCurrencyAmount
								? formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
										sign: selectedPriceCurrency.sign,
								  })
								: NO_VALUE}
						</SummaryItemValue>
					</SummaryItem>
					<SummaryItem>
						<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
						<SummaryItemValue>
							{exchangeFeeRate != null ? formatPercent(exchangeFeeRate) : NO_VALUE}
						</SummaryItemValue>
					</SummaryItem>
					<SummaryItem>
						<SummaryItemLabel>{t('exchange.summary-info.fee-cost')}</SummaryItemLabel>
						<SummaryItemValue>
							{exchangeFeeRate != null && baseCurrencyAmount
								? formatCurrency(
										selectedPriceCurrency.name,
										Number(baseCurrencyAmount) * exchangeFeeRate * basePriceRate,
										{ sign: selectedPriceCurrency.sign }
								  )
								: NO_VALUE}
						</SummaryItemValue>
					</SummaryItem>
				</SummaryItems>
			</DesktopOnlyView>
			<ErrorTooltip
				visible={feeReclaimPeriodInSeconds > 0}
				placement="top"
				content={
					<div>
						{t('exchange.errors.fee-reclamation', {
							waitingPeriod: secondsToTime(feeReclaimPeriodInSeconds),
							currencyKey: quoteCurrencyKey,
						})}
					</div>
				}
			>
				<span>
					<Button
						variant="primary"
						isRounded={true}
						disabled={isSubmissionDisabled}
						onClick={onSubmit}
						size="lg"
					>
						{getButtonLabel()}
					</Button>
				</span>
			</ErrorTooltip>
		</MessageContainer>
	);
};

const SummaryItems = styled.div`
	display: grid;
	grid-auto-flow: column;
	flex-grow: 1;
`;

const SummaryItem = styled.div`
	display: grid;
	grid-gap: 4px;
	width: 110px;
`;

const SummaryItemLabel = styled.div`
	text-transform: capitalize;
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
	max-width: 100px;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const StyledGasEditButton = styled.span`
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.purpleHover};
	text-transform: uppercase;
`;

const GasSpeedButtonContainer = styled.div`
	padding-bottom: 5px;
	button {
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
`;

const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.black};
`;

const CustomGasPrice = styled(NumericInput)`
	width: 100px;
	border: 1px solid ${(props) => props.theme.colors.stormcloud};
	margin-bottom: 5px;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const ErrorTooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.white};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export default TradeSummaryCard;
