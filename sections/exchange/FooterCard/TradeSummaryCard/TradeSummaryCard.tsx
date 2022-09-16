import useSynthetixQueries from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import Tippy from '@tippyjs/react';
import { FC, ReactNode, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Card from 'components/Card';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { CurrencyKey } from 'constants/currency';
import FeeCostSummaryItem from 'sections/shared/components/FeeCostSummary';
import FeeRateSummaryItem from 'sections/shared/components/FeeRateSummary';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import { secondsToTime } from 'utils/formatters/date';

import { MessageContainer } from '../common';
import { SummaryItems } from '../common';

type TradeSummaryCardProps = {
	submissionDisabledReason: ReactNode;
	onSubmit: () => void;
	feeReclaimPeriodInSeconds: number;
	quoteCurrencyKey: CurrencyKey | null;
	showFee?: boolean;
	className?: string;
	totalFeeRate: Wei | null;
	baseFeeRate?: Wei | null;
	transactionFee?: Wei | number | null;
	feeCost: Wei | null;
	isApproved?: boolean;
};

const TradeSummaryCard: FC<TradeSummaryCardProps> = memo(
	({
		submissionDisabledReason,
		onSubmit,
		feeReclaimPeriodInSeconds,
		quoteCurrencyKey,
		showFee = true,
		totalFeeRate,
		baseFeeRate,
		transactionFee,
		feeCost,
		isApproved = true,
		...rest
	}) => {
		const { t } = useTranslation();
		const { useEthGasPriceQuery } = useSynthetixQueries();

		const isSubmissionDisabled = useMemo(() => submissionDisabledReason != null, [
			submissionDisabledReason,
		]);

		const ethGasPriceQuery = useEthGasPriceQuery();

		const gasPrices = useMemo(() => ethGasPriceQuery?.data, [ethGasPriceQuery.data]);

		const summaryItems = useMemo(
			() => (
				<SummaryItems>
					<GasPriceSelect gasPrices={gasPrices} transactionFee={transactionFee} />
					{showFee && (
						<>
							<FeeRateSummaryItem totalFeeRate={totalFeeRate} baseFeeRate={baseFeeRate} />
							<FeeCostSummaryItem feeCost={feeCost} />
						</>
					)}
				</SummaryItems>
			),
			[gasPrices, transactionFee, totalFeeRate, baseFeeRate, feeCost, showFee]
		);

		return (
			<>
				<MobileOrTabletView>
					<MobileCard className="trade-summary-card">
						<Card.Body>{summaryItems}</Card.Body>
					</MobileCard>
				</MobileOrTabletView>
				<MessageContainer className="footer-card" {...rest}>
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
								disabled={isSubmissionDisabled}
								onClick={onSubmit}
								size="lg"
								data-testid="submit-order"
								fullWidth
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
	}
);

export const ErrorTooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export const MobileCard = styled(Card)`
	margin: 2px auto 20px auto;
`;

export default TradeSummaryCard;
