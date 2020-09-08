import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ethers } from 'ethers';
import styled from 'styled-components';
import get from 'lodash/get';

import synthetix, { Synth } from 'lib/synthetix';

import { NO_VALUE } from 'constants/placeholder';

import Button from 'components/Button';

import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { NoTextTransform, numericValueCSS } from 'styles/common';

import { RoundedContainer } from '../common';

type TradeInfoCardProps = {
	selectedPriceCurrency: Synth;
	isButtonDisabled: boolean;
	isSubmitting: boolean;
	baseCurrencyAmount: string;
	onSubmit: () => void;
	totalTradePrice: number;
	basePriceRate: number;
	baseCurrency: Synth | null;
};

const TradeInfoCard: FC<TradeInfoCardProps> = ({
	selectedPriceCurrency,
	isButtonDisabled,
	isSubmitting,
	baseCurrencyAmount,
	onSubmit,
	totalTradePrice,
	basePriceRate,
	baseCurrency,
}) => {
	const { t } = useTranslation();

	const exchangeFeeRateRaw: string | null =
		baseCurrency != null
			? get(synthetix.js, ['defaults', 'EXCHANGE_FEE_RATES', baseCurrency.category], null)
			: null;

	const exchangeFeeRate =
		exchangeFeeRateRaw != null ? Number(ethers.utils.formatEther(exchangeFeeRateRaw)) : null;

	return (
		<RoundedContainer>
			<TradeInfoItems>
				<TradeInfoItem>
					<TradeInfoLabel>{t('exchange.trade-info.slippage')}</TradeInfoLabel>
					<TradeInfoValue>{NO_VALUE}</TradeInfoValue>
				</TradeInfoItem>
				<TradeInfoItem>
					<TradeInfoLabel>
						<Trans
							i18nKey="common.currency.currency-value"
							values={{ currencyKey: selectedPriceCurrency.asset }}
							components={[<NoTextTransform />]}
						/>
					</TradeInfoLabel>
					<TradeInfoValue>
						{baseCurrencyAmount
							? formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
									sign: selectedPriceCurrency.sign,
							  })
							: NO_VALUE}
					</TradeInfoValue>
				</TradeInfoItem>
				<TradeInfoItem>
					<TradeInfoLabel>{t('exchange.trade-info.fee')}</TradeInfoLabel>
					<TradeInfoValue>
						{exchangeFeeRate != null ? formatPercent(exchangeFeeRate) : NO_VALUE}
					</TradeInfoValue>
				</TradeInfoItem>
				<TradeInfoItem>
					<TradeInfoLabel>{t('exchange.trade-info.fee-cost')}</TradeInfoLabel>
					<TradeInfoValue>
						{exchangeFeeRate != null && baseCurrencyAmount
							? formatCurrency(
									selectedPriceCurrency.name,
									Number(baseCurrencyAmount) * exchangeFeeRate * basePriceRate,
									{ sign: selectedPriceCurrency.sign }
							  )
							: NO_VALUE}
					</TradeInfoValue>
				</TradeInfoItem>
			</TradeInfoItems>
			<div>
				<Button
					variant="primary"
					isRounded={true}
					disabled={isButtonDisabled}
					onClick={onSubmit}
					size="lg"
				>
					{isSubmitting
						? t('exchange.trade-info.button.submitting-order')
						: isButtonDisabled
						? t('exchange.trade-info.button.enter-amount')
						: t('exchange.trade-info.button.submit-order')}
				</Button>
			</div>
		</RoundedContainer>
	);
};

const TradeInfoItems = styled.div`
	display: grid;
	grid-auto-flow: column;
	flex-grow: 1;
`;

const TradeInfoItem = styled.div`
	display: grid;
	grid-gap: 4px;
`;

const TradeInfoLabel = styled.div`
	text-transform: capitalize;
`;

const TradeInfoValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

export default TradeInfoCard;
