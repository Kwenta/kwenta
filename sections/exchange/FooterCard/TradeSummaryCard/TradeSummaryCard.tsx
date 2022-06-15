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

import { MessageContainer } from '../common';

import { SummaryItems } from '../common';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import FeeRateSummaryItem from 'sections/shared/components/FeeRateSummary';
import FeeCostSummaryItem from 'sections/shared/components/FeeCostSummary';
import { GasPrices } from '@synthetixio/queries';
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
	totalFeeRate: Wei | null;
	baseFeeRate?: Wei | null;
	transactionFee?: number | null;
	feeCost: Wei | null;
	isApproved?: boolean;
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
	totalFeeRate,
	baseFeeRate,
	transactionFee,
	feeCost,
	isApproved = true,
	...rest
}) => {
	const { t } = useTranslation();

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const summaryItems = (
		<SummaryItems attached={attached}>
			<GasPriceSelect gasPrices={gasPrices} transactionFee={transactionFee} />
			{showFee && (
				<>
					<FeeRateSummaryItem totalFeeRate={totalFeeRate} baseFeeRate={baseFeeRate} />
					<FeeCostSummaryItem feeCost={feeCost} />
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
							isRounded={true}
							disabled={isSubmissionDisabled}
							onClick={onSubmit}
							size="lg"
							data-testid="submit-order"
							fullWidth={true}
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export const MobileCard = styled(Card)`
	margin: 2px auto 20px auto;
`;

export default TradeSummaryCard;
