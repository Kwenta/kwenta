import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';
import styled from 'styled-components';
import { DeprecatedSynthsBalances, SynthFeeAndWaitingPeriod } from '@synthetixio/queries';

import Card from 'components/Card';

import { OrdersGroupListItem, NoResults } from './common';
import FullScreenModal from 'components/FullScreenModal';
import { OrderGroup } from './types';
import CurrencyFeeReclaim from './CurrencyFeeReclaim';
import CurrencyExchange from './CurrencyExchange';
import RedeemableDeprecatedSynths from './RedeemableDeprecatedSynths';

type FullScreenProps = {
	onDismiss?: () => void;
	orderGroups: OrderGroup[];
	feeWaitingPeriods: SynthFeeAndWaitingPeriod[];
	hasWaitingPeriod: boolean;
	hasRedeemableDeprecatedSynths: boolean;
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>;
};

export const FullScreen: FC<FullScreenProps> = ({
	orderGroups,
	feeWaitingPeriods,
	hasWaitingPeriod,
	hasRedeemableDeprecatedSynths,
	redeemableDeprecatedSynthsQuery,
}) => {
	const { t } = useTranslation();

	return (
		<StyledFullScreenModal isOpen={true} title={t('modals.notifications.title')}>
			{!hasWaitingPeriod ? null : (
				<StyledCard>
					<StyledCardHeader>
						{t('modals.notifications.fee-reclaiming-synths.title')}
					</StyledCardHeader>
					<StyledCardBody>
						{feeWaitingPeriods.map(({ currencyKey, waitingPeriod }) =>
							waitingPeriod === 0 ? null : (
								<CurrencyFeeReclaim key={currencyKey} {...{ currencyKey, waitingPeriod }} />
							)
						)}
					</StyledCardBody>
				</StyledCard>
			)}

			{!hasRedeemableDeprecatedSynths ? null : (
				<StyledCard>
					<StyledCardHeader>
						{t('modals.notifications.fee-reclaiming-synths.title')}
					</StyledCardHeader>
					<StyledCardBody>
						<RedeemableDeprecatedSynths
							{...{
								redeemableDeprecatedSynthsQuery,
							}}
						/>
					</StyledCardBody>
				</StyledCard>
			)}

			{orderGroups.map((group) => (
				<StyledCard key={group.id}>
					<StyledCardHeader>{group.title}</StyledCardHeader>
					<StyledCardBody>
						{group.data.length ? (
							group.data.map((order) => (
								<OrdersGroupListItem key={order.hash}>
									<CurrencyExchange order={order} />
								</OrdersGroupListItem>
							))
						) : (
							<OrdersGroupListItem>
								<NoResults>{group.noResults}</NoResults>
							</OrdersGroupListItem>
						)}
					</StyledCardBody>
				</StyledCard>
			))}
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	[data-reach-dialog-content] {
		width: 640px;
	}
	${OrdersGroupListItem} {
		border-color: ${(props) => props.theme.colors.vampire};
		&:last-child {
			border: none;
		}
	}
`;

const StyledCard = styled(Card)`
	margin-bottom: 40px;
`;

const StyledCardHeader = styled(Card.Header)`
	height: 45px;
	border-color: ${(props) => props.theme.colors.vampire};
`;

const StyledCardBody = styled(Card.Body)`
	padding: 0;
`;

export default FullScreen;
