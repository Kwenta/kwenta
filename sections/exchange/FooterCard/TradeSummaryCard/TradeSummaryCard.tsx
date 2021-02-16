import { FC, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled, { css } from 'styled-components';
import Tippy from '@tippyjs/react';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { useRecoilState } from 'recoil';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';

import { Synth } from 'lib/synthetix';

import { GasPrices, GAS_SPEEDS } from 'queries/network/useEthGasPriceQuery';

import { NO_VALUE, ESTIMATE_VALUE } from 'constants/placeholder';
import { CurrencyKey } from 'constants/currency';

import { secondsToTime } from 'utils/formatters/date';

import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NumericInput from 'components/Input/NumericInput';
import Card from 'components/Card';

import InfoIcon from 'assets/svg/app/info.svg';

import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { NoTextTransform, numericValueCSS, NumericValue } from 'styles/common';
import media from 'styles/media';

import { MessageContainer, SubmissionDisabledReason } from '../common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type TradeSummaryCardProps = {
	submissionDisabledReason: SubmissionDisabledReason | null;
	baseCurrencyAmount: string;
	onSubmit: () => void;
	totalTradePrice: string;
	basePriceRate: number;
	baseCurrency: Synth | null;
	gasPrices: GasPrices | undefined;
	feeReclaimPeriodInSeconds: number;
	quoteCurrencyKey: CurrencyKey | null;
	showFee?: boolean;
	attached?: boolean;
	className?: string;
	feeRate: BigNumber | null;
	transactionFee?: number | null;
	feeCost: BigNumber | null;
	isApproved?: boolean;
	isCreateShort?: boolean;
	shortInterestRate?: BigNumber | null;
};

const TradeSummaryCard: FC<TradeSummaryCardProps> = ({
	submissionDisabledReason,
	baseCurrencyAmount,
	onSubmit,
	totalTradePrice,
	basePriceRate,
	baseCurrency,
	gasPrices,
	feeReclaimPeriodInSeconds,
	quoteCurrencyKey,
	showFee = true,
	attached,
	feeRate,
	transactionFee,
	feeCost,
	isApproved = true,
	isCreateShort = false,
	shortInterestRate = null,
	...rest
}) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? gasPrices[gasSpeed] : null;

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const gasPriceItem = hasCustomGasPrice ? (
		<span data-testid="gas-price">{Number(customGasPrice)}</span>
	) : (
		<span data-testid="gas-price">
			{ESTIMATE_VALUE} {gasPrice}
		</span>
	);

	const summaryItems = (
		<SummaryItems attached={attached}>
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
			<SummaryItem>
				{isCreateShort ? (
					<>
						<SummaryItemLabel>{t('shorting.common.interestRate')}</SummaryItemLabel>
						<SummaryItemValue data-testid="short-interest-rate">
							{formatPercent((shortInterestRate ?? 0).toString())}
						</SummaryItemValue>
					</>
				) : (
					<>
						<SummaryItemLabel>
							<Trans
								i18nKey="common.currency.currency-value"
								values={{ currencyKey: selectedPriceCurrency.asset }}
								components={[<NoTextTransform />]}
							/>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="total-trade-price">
							{baseCurrencyAmount
								? formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
										sign: selectedPriceCurrency.sign,
								  })
								: NO_VALUE}
						</SummaryItemValue>
					</>
				)}
			</SummaryItem>
			{showFee && (
				<>
					<SummaryItem>
						<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
						<SummaryItemValue data-testid="exchange-fee-rate">
							{feeRate != null ? formatPercent(feeRate) : NO_VALUE}
						</SummaryItemValue>
					</SummaryItem>
					<SummaryItem>
						<SummaryItemLabel>{t('exchange.summary-info.fee-cost')}</SummaryItemLabel>
						<SummaryItemValue data-testid="exchange-fee-cost">
							{feeCost != null
								? formatCurrency(selectedPriceCurrency.name, feeCost, {
										sign: selectedPriceCurrency.sign,
										minDecimals: feeCost.lt(0.01) ? 4 : 2,
								  })
								: NO_VALUE}
						</SummaryItemValue>
					</SummaryItem>
				</>
			)}
		</SummaryItems>
	);

	return (
		<>
			<MobileOrTabletView>
				<MobileCard className="trade-summary-card">
					<Card.Body>{summaryItems}</Card.Body>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card" {...rest}>
				<DesktopOnlyView>{summaryItems}</DesktopOnlyView>
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
							data-testid="submit-order"
						>
							{isSubmissionDisabled
								? t(`exchange.summary-info.button.${submissionDisabledReason}`)
								: !isApproved
								? t('exchange.summary-info.button.approve')
								: t('exchange.summary-info.button.submit-order')}
						</Button>
					</span>
				</ErrorTooltip>
			</MessageContainer>
		</>
	);
};

export const SummaryItems = styled.div<{ attached?: boolean }>`
	display: grid;
	grid-auto-flow: column;
	flex-grow: 1;
	${media.lessThan('md')`
		grid-auto-flow: unset;
		grid-template-columns: auto auto;
		grid-template-rows: auto auto;
		grid-gap: 20px;
	`}

	${(props) =>
		props.attached &&
		css`
			& {
				grid-template-rows: unset;
			}
		`}
`;

export const SummaryItem = styled.div`
	display: grid;
	grid-gap: 4px;
	width: 110px;
	${media.lessThan('md')`
		width: unset;
	`}
`;

export const SummaryItemLabel = styled.div`
	text-transform: capitalize;
`;

export const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
	max-width: 100px;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

export const GasPriceCostTooltip = styled(GasPriceTooltip)`
	width: auto;
	font-size: 12px;
	.tippy-content {
		padding: 5px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export const GasSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

export const CustomGasPriceContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

export const CustomGasPrice = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export const StyledGasButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
`;

export const GasPriceItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

export const StyledGasEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.goldColors.color3};
	text-transform: uppercase;
`;

export const ErrorTooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.white};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export const MobileCard = styled(Card)`
	margin: 0 auto 86px auto;
`;

export default TradeSummaryCard;
