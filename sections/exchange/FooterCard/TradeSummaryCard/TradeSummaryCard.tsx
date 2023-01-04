import useSynthetixQueries from '@synthetixio/queries';
import { FC, useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Card from 'components/Card';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import FeeCostSummaryItem from 'sections/shared/components/FeeCostSummary';
import FeeRateSummaryItem from 'sections/shared/components/FeeRateSummary';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import PriceImpactSummary from 'sections/shared/components/PriceImpactSummary';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { submitApprove, submitExchange } from 'state/exchange/actions';
import {
	selectFeeCostWei,
	selectIsApproved,
	selectShowFee,
	selectSlippagePercentWei,
	selectSubmissionDisabledReason,
	selectTransactionFeeWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { secondsToTime } from 'utils/formatters/date';

import { ErrorTooltip, MessageContainer } from '../common';
import { SummaryItems } from '../common';

const TradeSummaryCard: FC = memo(() => {
	const { t } = useTranslation();

	const { feeReclaimPeriod, openModal } = useAppSelector(({ exchange }) => ({
		feeReclaimPeriod: exchange.feeReclaimPeriod,
		openModal: exchange.openModal,
	}));

	const quoteCurrencyKey = useAppSelector(({ exchange }) => exchange.quoteCurrencyKey);
	const dispatch = useAppDispatch();

	const isApproved = useAppSelector(selectIsApproved);

	const onSubmit = useCallback(() => {
		if (!isApproved) {
			dispatch(submitApprove());
		} else {
			dispatch(submitExchange());
		}
	}, [dispatch, isApproved]);

	const handleApprove = useCallback(() => {
		dispatch(submitApprove());
	}, [dispatch]);

	return (
		<>
			<MobileOrTabletView>
				<MobileCard className="trade-summary-card">
					<Card.Body>
						<SummaryItemsWrapper />
					</Card.Body>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<DesktopOnlyView>
					<SummaryItemsWrapper />
				</DesktopOnlyView>
				<ErrorTooltip
					visible={feeReclaimPeriod > 0}
					preset="top"
					content={
						<div>
							{t('exchange.errors.fee-reclamation', {
								waitingPeriod: secondsToTime(feeReclaimPeriod),
								currencyKey: quoteCurrencyKey,
							})}
						</div>
					}
				>
					<span>
						<SubmissionButton onSubmit={onSubmit} isApproved={isApproved} />
					</span>
				</ErrorTooltip>
			</MessageContainer>
			{openModal === 'confirm' && <TxConfirmationModal attemptRetry={onSubmit} />}
			{openModal === 'approve' && <TxApproveModal attemptRetry={handleApprove} />}
		</>
	);
});

const SummaryItemsWrapper = () => {
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const gasPrices = useMemo(() => ethGasPriceQuery?.data, [ethGasPriceQuery.data]);
	const transactionFee = useAppSelector(selectTransactionFeeWei);
	const feeCost = useAppSelector(selectFeeCostWei);
	const showFee = useAppSelector(selectShowFee);
	const slippagePercent = useAppSelector(selectSlippagePercentWei);

	return (
		<SummaryItems>
			<GasPriceSelect gasPrices={gasPrices} transactionFee={transactionFee} />
			<PriceImpactSummary slippagePercent={slippagePercent} />
			{showFee && (
				<>
					<FeeRateSummaryItem />
					<FeeCostSummaryItem feeCost={feeCost} />
				</>
			)}
		</SummaryItems>
	);
};

const SubmissionButton = ({ onSubmit, isApproved }: any) => {
	const { t } = useTranslation();
	const submissionDisabledReason = useAppSelector(selectSubmissionDisabledReason);

	const isSubmissionDisabled = useMemo(() => submissionDisabledReason != null, [
		submissionDisabledReason,
	]);

	return (
		<Button
			disabled={isSubmissionDisabled}
			onClick={onSubmit}
			size="lg"
			data-testid="submit-order"
			fullWidth
		>
			{!!submissionDisabledReason
				? t(submissionDisabledReason)
				: !isApproved
				? t('exchange.summary-info.button.approve')
				: t('exchange.summary-info.button.submit-order')}
		</Button>
	);
};

const MobileCard = styled(Card)`
	margin: 2px auto 20px auto;
`;

export default TradeSummaryCard;
