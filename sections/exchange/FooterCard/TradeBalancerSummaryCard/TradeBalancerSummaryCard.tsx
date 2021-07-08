import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import { GasPrices } from 'queries/network/useEthGasPriceQuery';

import Button from 'components/Button';

import { numericValueCSS, FlexDivRowCentered, FlexDivCol } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import SlippageSelect from 'sections/shared/components/SlippageSelect';

type TradeBalancerSummaryCardProps = {
	submissionDisabledReason: ReactNode;
	onSubmit: () => void;
	gasPrices: GasPrices | undefined;
	estimatedSlippage: BigNumber;
	setMaxSlippageTolerance: (num: string) => void;
	maxSlippageTolerance: string;
	isApproved?: boolean;
};

const TradeBalancerSummaryCard: FC<TradeBalancerSummaryCardProps> = ({
	submissionDisabledReason,
	onSubmit,
	gasPrices,
	estimatedSlippage,
	maxSlippageTolerance,
	setMaxSlippageTolerance,
	isApproved = true,
}) => {
	const { t } = useTranslation();

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	return (
		<SummaryItems>
			<StyledSlippageSelect
				maxSlippageTolerance={maxSlippageTolerance}
				setMaxSlippageTolerance={setMaxSlippageTolerance}
			/>
			<SummaryItem>
				<SummaryItemLabel>{t('modals.afterHours.estimated-slippage')}</SummaryItemLabel>
				<SummaryItemValue>{formatPercent(estimatedSlippage.toNumber())}</SummaryItemValue>
			</SummaryItem>
			<StyledGasPriceSelect gasPrices={gasPrices} transactionFee={null} />
			<StyledButton
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
					? t('exchange.summary-info.button.approve-balancer')
					: t('exchange.summary-info.button.submit-order')}
			</StyledButton>
		</SummaryItems>
	);
};

const SummaryItems = styled(FlexDivCol)`
	margin: 10px auto;
`;

const SummaryItem = styled(FlexDivRowCentered)`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
	height: 40px;
	width: 320px;
`;

const SummaryItemLabel = styled.div`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.blueberry};
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

const StyledButton = styled(Button)`
	margin: 20px auto 0 auto;
	width: 320px;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	height: 40px;
	width: 320px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: auto;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.blueberry};
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
`;

const StyledSlippageSelect = styled(SlippageSelect)`
	height: 40px;
	width: 320px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: auto;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.blueberry};
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
`;

export default TradeBalancerSummaryCard;
