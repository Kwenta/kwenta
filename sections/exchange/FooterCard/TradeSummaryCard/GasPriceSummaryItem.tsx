import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { isL2State, isMainnetState } from 'store/wallet';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import { NO_VALUE, ESTIMATE_VALUE } from 'constants/placeholder';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';

import InfoIcon from 'assets/svg/app/info.svg';

import { formatCurrency, formatNumber } from 'utils/formatters/number';

import { NumericValue } from 'styles/common';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import { GasPrices, GAS_SPEEDS } from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import useGas, { parseGasPriceObject } from 'hooks/useGas';

type GasPriceSummaryItemProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: number | null;
	className?: string;
};

const GasPriceSummaryItem: FC<GasPriceSummaryItemProps> = ({
	gasPrices,
	transactionFee,
	...rest
}) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const isL2 = useRecoilValue(isL2State);
	const isMainnet = useRecoilValue(isMainnetState);
	const {
		gasPrice,
		gasSpeed,
		setGasSpeed,
		isCustomGasPrice,
		customGasPrice,
		setCustomGasPrice,
	} = useGas();

	const gasEstimateInfo = isMainnet ? (
		<GasEstimateInfo>
			It is recommended to not edit the Max Fee. The difference between Max Fee and Current Gas
			Price will be refunded to the user
		</GasEstimateInfo>
	) : null;

	const gasPriceItem = isCustomGasPrice ? (
		<span data-testid="gas-price">{formatNumber(customGasPrice, { minDecimals: 4 })}</span>
	) : (
		<span data-testid="gas-price">
			{ESTIMATE_VALUE} {formatNumber(gasPrice ?? 0, { minDecimals: 4 })}
		</span>
	);

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{isMainnet || !isCustomGasPrice
					? t('exchange.summary-info.max-fee-gwei')
					: t('exchange.summary-info.gas-price-gwei')}
			</SummaryItemLabel>
			<SummaryItemValue>
				{gasPrice != null ? (
					<>
						{transactionFee != null ? (
							<GasPriceCostTooltip
								content={
									<GasEstimateUSD>
										<GasEstimateUSDAmount>
											{formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee, {
												sign: selectedPriceCurrency.sign,
												maxDecimals: 1,
											})}
										</GasEstimateUSDAmount>
										{gasEstimateInfo}
									</GasEstimateUSD>
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
						{isL2 ? null : (
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
												isActive={isCustomGasPrice ? false : gasSpeed === speed}
											>
												<span>{t(`common.gas-prices.${speed}`)}</span>
												<NumericValue>
													{formatNumber(parseGasPriceObject(gasPrices![speed]) ?? 0, {
														maxDecimals: 1,
													})}
												</NumericValue>
											</StyledGasButton>
										))}
									</GasSelectContainer>
								}
								interactive={true}
							>
								<StyledGasEditButton role="button">{t('common.edit')}</StyledGasEditButton>
							</GasPriceTooltip>
						)}
					</>
				) : (
					NO_VALUE
				)}
			</SummaryItemValue>
		</SummaryItem>
	);
};

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

export const GasEstimateUSD = styled.span`
	text-align: center;
`;

export const GasEstimateUSDAmount = styled.p`
	color: #ffdf6d;
`;

export const GasEstimateInfo = styled.p`
	text-align: center;
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

export default GasPriceSummaryItem;
