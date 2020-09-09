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

type TradeSummaryCardProps = {
	selectedPriceCurrency: Synth;
	isButtonDisabled: boolean;
	isSubmitting: boolean;
	baseCurrencyAmount: string;
	onSubmit: () => void;
	totalTradePrice: number;
	basePriceRate: number;
	baseCurrency: Synth | null;
	insufficientBalance: boolean;
};

const TradeSummaryCard: FC<TradeSummaryCardProps> = ({
	selectedPriceCurrency,
	isButtonDisabled,
	isSubmitting,
	baseCurrencyAmount,
	onSubmit,
	totalTradePrice,
	basePriceRate,
	baseCurrency,
	insufficientBalance,
}) => {
	const { t } = useTranslation();

	const exchangeFeeRateRaw: string | null =
		baseCurrency != null
			? get(synthetix.js, ['defaults', 'EXCHANGE_FEE_RATES', baseCurrency.category], null)
			: null;

	const exchangeFeeRate =
		exchangeFeeRateRaw != null ? Number(ethers.utils.formatEther(exchangeFeeRateRaw)) : null;

	function getButtonLabel() {
		if (insufficientBalance) {
			return t('exchange.summary-info.button.insufficient-balance');
		}
		if (isButtonDisabled) {
			return t('exchange.summary-info.button.enter-amount');
		}
		if (isSubmitting) {
			return t('exchange.summary-info.button.submitting-order');
		}
		return t('exchange.summary-info.button.submit-order');
	}
	return (
		<RoundedContainer>
			<SummaryItems>
				<SummaryItem>
					<SummaryItemLabel>{t('exchange.summary-info.slippage')}</SummaryItemLabel>
					<SummaryItemValue>{NO_VALUE}</SummaryItemValue>
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
			<Button
				variant="primary"
				isRounded={true}
				disabled={isButtonDisabled}
				onClick={onSubmit}
				size="lg"
			>
				{getButtonLabel()}
			</Button>
		</RoundedContainer>
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
`;

const SummaryItemLabel = styled.div`
	text-transform: capitalize;
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

export default TradeSummaryCard;
