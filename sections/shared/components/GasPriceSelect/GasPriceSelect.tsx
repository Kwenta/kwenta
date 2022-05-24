import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { customGasPriceState, gasSpeedState, isMainnetState } from 'store/wallet';
import { useRecoilValue, useRecoilState } from 'recoil';
import Wei from '@synthetixio/wei';

import { NO_VALUE } from 'constants/placeholder';

import InfoIcon from 'assets/svg/app/info.svg';

import { formatCurrency, formatNumber } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import { GasPrices } from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import { parseGasPriceObject } from 'hooks/useGas';

type GasPriceSelectProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: Wei | number | null;
	className?: string;
};

const GasPriceSelect: FC<GasPriceSelectProps> = ({ gasPrices, transactionFee, ...rest }) => {
	const { t } = useTranslation();
	const [gasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);
	const [customGasPrice] = useRecoilState(customGasPriceState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const isMainnet = useRecoilValue(isMainnetState);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? parseGasPriceObject(gasPrices[gasSpeed]) : null;

	const gasPriceItem = hasCustomGasPrice ? (
		<span data-testid="gas-price">{formatNumber(customGasPrice, { minDecimals: 4 })}</span>
	) : (
		<span data-testid="gas-price">{formatNumber(gasPrice ?? 0, { minDecimals: 4 })}</span>
	);

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{isMainnet
					? t('common.summary.gas-prices.max-fee')
					: t('common.summary.gas-prices.gas-price')}
			</SummaryItemLabel>
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
									<InfoIcon />
								</GasPriceItem>
							</GasPriceCostTooltip>
						) : (
							gasPriceItem
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
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 4px;
	width: 155px;
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

const GasPriceItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

export default GasPriceSelect;
