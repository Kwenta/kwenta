import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';
import styled from 'styled-components';
import { DeprecatedSynthsBalances, SynthFeeAndWaitingPeriod } from '@synthetixio/queries';

import { TextButton } from 'styles/common';

import { MenuModal } from '../common';
import CurrencyExchange from './CurrencyExchange';
import RedeemableDeprecatedSynths from './RedeemableDeprecatedSynths';

import {
	OrdersGroup,
	OrdersGroupTitle,
	OrdersGroupList,
	OrdersGroupListItem,
	NoResults,
} from './common';
import CurrencyFeeReclaim from './CurrencyFeeReclaim';

import { OrderGroup } from './types';
import { OrderByStatus } from 'store/orders';

type PopupProps = {
	onDismiss: () => void;
	setIsFullScreen: (flag: boolean) => void;
	orderGroups: OrderGroup[];
	ordersByStatus: OrderByStatus;
	feeWaitingPeriods: SynthFeeAndWaitingPeriod[];
	hasWaitingPeriod: boolean;
	hasRedeemableDeprecatedSynths: boolean;
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>;
};

export const Popup: FC<PopupProps> = ({
	onDismiss,
	orderGroups,
	setIsFullScreen,
	ordersByStatus,
	feeWaitingPeriods,
	hasWaitingPeriod,
	hasRedeemableDeprecatedSynths,
	redeemableDeprecatedSynthsQuery,
}) => {
	const { t } = useTranslation();

	const hasConfirmedOrders = ordersByStatus.confirmed.length > 0;
	const hasPendingOrders = ordersByStatus.pending.length > 0;
	const hasCancelledOrders = ordersByStatus.cancelled.length > 0;

	const hasOrders =
		hasConfirmedOrders || hasPendingOrders || hasCancelledOrders || hasRedeemableDeprecatedSynths;

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.notifications.title')}>
			{!(hasOrders || hasWaitingPeriod) ? (
				<StyledNoResults>
					{t('modals.notifications.recent-notifications.no-results')}
				</StyledNoResults>
			) : hasWaitingPeriod ? (
				<OrdersGroup>
					<OrdersGroupTitle>
						{t('modals.notifications.fee-reclaiming-synths.title')}
					</OrdersGroupTitle>
					<OrdersGroupList>
						{feeWaitingPeriods.map(({ waitingPeriod, currencyKey }) => {
							return waitingPeriod === 0 ? null : (
								<CurrencyFeeReclaim key={currencyKey} {...{ currencyKey, waitingPeriod }} />
							);
						})}
					</OrdersGroupList>
				</OrdersGroup>
			) : hasRedeemableDeprecatedSynths ? (
				<OrdersGroup>
					<OrdersGroupTitle>{t('modals.notifications.deprecated-synths.title')}</OrdersGroupTitle>
					<OrdersGroupList>
						<RedeemableDeprecatedSynths
							{...{
								redeemableDeprecatedSynthsQuery,
							}}
						/>
					</OrdersGroupList>
				</OrdersGroup>
			) : hasOrders ? (
				<>
					{orderGroups.map((group) => (
						<OrdersGroup key={group.id}>
							<OrdersGroupTitle>{group.title}</OrdersGroupTitle>
							<OrdersGroupList>
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
							</OrdersGroupList>
						</OrdersGroup>
					))}
					{hasPendingOrders && (
						<ViewAllButtonContainer>
							<ViewAllButton onClick={() => setIsFullScreen(true)}>
								{t('modals.notifications.view-all')}
							</ViewAllButton>
						</ViewAllButtonContainer>
					)}
				</>
			) : null}
		</StyledMenuModal>
	);
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 8px 0 16px 0;
	}
`;
const ViewAllButtonContainer = styled.div`
	margin: 0 auto;
	text-align: center;
`;
const ViewAllButton = styled(TextButton)`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
`;
const StyledNoResults = styled(NoResults)`
	font-size: 14px;
	text-align: center;
	padding: 100px 0;
`;

export default Popup;
