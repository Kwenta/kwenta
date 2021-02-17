import { FC, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import BigNumber from 'bignumber.js';

import { Synth } from 'lib/synthetix';

import { GasPrices } from 'queries/network/useEthGasPriceQuery';

import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey } from 'constants/currency';

import { secondsToTime } from 'utils/formatters/date';

import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';

import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { NoTextTransform } from 'styles/common';

import { MessageContainer, SubmissionDisabledReason } from '../common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItems, SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

import GasPriceSummaryItem from './GasPriceSummaryItem';

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
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const summaryItems = (
		<SummaryItems attached={attached}>
			<GasPriceSummaryItem gasPrices={gasPrices} transactionFee={transactionFee} />
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
