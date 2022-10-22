import useSynthetixQueries from '@synthetixio/queries';
import { FC, useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { submitApprove, submitExchange } from 'state/exchange/actions';
import {
	selectFeeCostWei,
	selectIsApproved,
	selectNeedsApproval,
	selectShowFee,
	selectSubmissionDisabledReason,
	selectTransactionFeeWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import styled from 'styled-components';

import Button from 'components/Button';
import Card from 'components/Card';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import FeeCostSummaryItem from 'sections/shared/components/FeeCostSummary';
import FeeRateSummaryItem from 'sections/shared/components/FeeRateSummary';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { secondsToTime } from 'utils/formatters/date';

import { MessageContainer } from '../common';
import { SummaryItems } from '../common';

type TradeSummaryCardProps = {
	className?: string;
};

const TradeSummaryCard: FC<TradeSummaryCardProps> = memo(({ ...rest }) => {
	const { t } = useTranslation();

	const { feeReclaimPeriod, openModal } = useAppSelector(({ exchange }) => ({
		feeReclaimPeriod: exchange.feeReclaimPeriod,
		openModal: exchange.openModal,
	}));

	const quoteCurrencyKey = useAppSelector(({ exchange }) => exchange.quoteCurrencyKey);
	const dispatch = useAppDispatch();

	const isApproved = useAppSelector(selectIsApproved);
	const needsApproval = useAppSelector(selectNeedsApproval);

	const onSubmit = useCallback(() => {
		if (needsApproval) {
			dispatch(submitApprove());
		} else if (isApproved) {
			dispatch(submitExchange());
		}
	}, [needsApproval, dispatch, isApproved]);

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
			<MessageContainer className="footer-card" {...rest}>
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

	return (
		<SummaryItems>
			<GasPriceSelect gasPrices={gasPrices} transactionFee={transactionFee} />
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

export const ErrorTooltip = styled(StyledTooltip)`
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
