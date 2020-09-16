import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ethers } from 'ethers';
import styled from 'styled-components';
import get from 'lodash/get';

import synthetix, { Synth } from 'lib/synthetix';

import { GasSpeed } from 'queries/network/useGasStationQuery';

import { NO_VALUE } from 'constants/placeholder';

import Button from 'components/Button';

import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { NoTextTransform, numericValueCSS } from 'styles/common';

import { RoundedContainer } from '../common';

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
	gasPrice: GasSpeed | undefined;
	feeReclaimPeriodInSeconds: number;
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
	gasPrice,
	feeReclaimPeriodInSeconds,
}) => {
	const { t } = useTranslation();

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
		<RoundedContainer>
			<SummaryItems>
				<SummaryItem>
					<SummaryItemLabel>{t('exchange.summary-info.gas-price')}</SummaryItemLabel>
					<SummaryItemValue>
						{gasPrice != null
							? t('exchange.summary-info.price-in-gwei', { price: gasPrice.average })
							: NO_VALUE}
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
			<Button
				variant="primary"
				isRounded={true}
				disabled={isSubmissionDisabled}
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
