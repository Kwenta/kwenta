import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { customGasPriceState, gasSpeedState, isL2State } from 'store/wallet';
import { useRecoilValue, useRecoilState } from 'recoil';
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

type GasPriceSelectProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: number | null;
	className?: string;
};

const GasPriceSelect: FC<GasPriceSelectProps> = ({ gasPrices, transactionFee, ...rest }) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const isL2 = useRecoilValue(isL2State);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? gasPrices[gasSpeed] : null;

	const gasPriceItem = hasCustomGasPrice ? (
		<span data-testid="gas-price">{formatNumber(customGasPrice, { minDecimals: 4 })}</span>
	) : (
		<span data-testid="gas-price">
			{ESTIMATE_VALUE} {formatNumber(gasPrice ?? 0, { minDecimals: 4 })}
		</span>
	);

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>{t('common.summary.gas-prices.title')}</SummaryItemLabel>
			<SummaryItemValue>
				{gasPrice != null ? (
					<>
						{transactionFee != null ? (
							<GasPriceCostTooltip
								content={
									<span>
										{formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee, {
											sign: selectedPriceCurrency.sign,
											maxDecimals: 1,
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
												isActive={hasCustomGasPrice ? false : gasSpeed === speed}
											>
												<span>{t(`common.summary.gas-prices.${speed}`)}</span>
												<NumericValue>{gasPrices![speed]}</NumericValue>
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

const GasPriceTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const GasPriceCostTooltip = styled(GasPriceTooltip)`
	width: auto;
	font-size: 12px;
	.tippy-content {
		padding: 5px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const GasSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const CustomGasPriceContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

const CustomGasPrice = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const StyledGasButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
`;

const GasPriceItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

const StyledGasEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.goldColors.color3};
	text-transform: uppercase;
`;

export default GasPriceSelect;
