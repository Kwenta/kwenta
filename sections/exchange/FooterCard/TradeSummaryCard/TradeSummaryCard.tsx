import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';

import Wei from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';

import { secondsToTime } from 'utils/formatters/date';

import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';

import { formatPercent } from 'utils/formatters/number';

import { MessageContainer } from '../common';

import { SummaryItems, SummaryItem, SummaryItemLabel, SummaryItemValue } from '../common';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import FeeRateSummary from 'sections/shared/components/FeeRateSummary';
import FeeCostSummary from 'sections/shared/components/FeeCostSummary';

import TotalTradePriceSummaryItem from './TotalTradePriceSummaryItem';
import { GasPrices } from '@synthetixio/queries';
import PoweredBy1Inch from 'components/PoweredBy1Inch';
import { Synth } from '@synthetixio/contracts-interface';

type TradeSummaryCardProps = {
	submissionDisabledReason: ReactNode;
	baseCurrencyAmount: string;
	onSubmit: () => void;
	totalTradePrice: string | null;
	basePriceRate: number;
	baseCurrency: Synth | null;
	gasPrices: GasPrices | undefined;
	feeReclaimPeriodInSeconds: number;
	quoteCurrencyKey: CurrencyKey | null;
	showFee?: boolean;
	attached?: boolean;
	className?: string;
	feeRate: Wei | null;
	transactionFee?: number | null;
	feeCost: Wei | null;
	isApproved?: boolean;
	isCreateShort?: boolean;
	shortInterestRate?: Wei | null;
	show1InchProvider?: boolean;
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
	show1InchProvider = false,
	...rest
}) => {
	const { t } = useTranslation();

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const summaryItems = (
		<SummaryItems attached={attached}>
			<GasPriceSelect gasPrices={gasPrices} transactionFee={transactionFee} />
			<SummaryItem>
				{isCreateShort ? (
					<>
						<SummaryItemLabel>{t('shorting.common.interestRate')}</SummaryItemLabel>
						<SummaryItemValue data-testid="short-interest-rate">
							{formatPercent((shortInterestRate ?? 0).toString())}
						</SummaryItemValue>
					</>
				) : (
					<TotalTradePriceSummaryItem totalTradePrice={totalTradePrice} />
				)}
			</SummaryItem>
			{showFee && (
				<>
					<FeeRateSummary feeRate={feeRate} />
					<FeeCostSummary feeCost={feeCost} />
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
			<MessageContainer
				attached={attached}
				className="footer-card"
				showProvider={show1InchProvider}
				{...rest}
			>
				{show1InchProvider && <PoweredBy1Inch />}
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
								? submissionDisabledReason
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
	margin: 2px auto 20px auto;
`;

export default TradeSummaryCard;
