import useSynthetixQueries from '@synthetixio/queries';
import { FC, useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Card, { CardBody } from 'components/Card';
import { MessageContainer } from 'components/exchange/message';
import { SummaryItems } from 'components/exchange/summary';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ErrorTooltip from 'components/Tooltip/ErrorTooltip';
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

const TradeSummaryCard: FC = memo(() => {
	const dispatch = useAppDispatch();
	const openModal = useAppSelector(({ exchange }) => exchange.openModal);
	const isApproved = useAppSelector(selectIsApproved);

	// TODO: Make this a Redux action in itself.
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
					<CardBody>
						<SummaryItemsWrapper />
					</CardBody>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<DesktopOnlyView>
					<SummaryItemsWrapper />
				</DesktopOnlyView>
				<TradeErrorTooltip {...{ onSubmit, isApproved }} />
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

type TradeErrorTooltipProps = {
	onSubmit(): void;
};

const TradeErrorTooltip: FC<TradeErrorTooltipProps> = memo(({ onSubmit }) => {
	const { t } = useTranslation();

	const isApproved = useAppSelector(selectIsApproved);
	const { feeReclaimPeriod, quoteCurrencyKey } = useAppSelector(({ exchange }) => ({
		feeReclaimPeriod: exchange.feeReclaimPeriod,
		quoteCurrencyKey: exchange.quoteCurrencyKey,
	}));

	return (
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
	);
});

const MobileCard = styled(Card)`
	margin: 2px auto 20px auto;
`;

export default TradeSummaryCard;
