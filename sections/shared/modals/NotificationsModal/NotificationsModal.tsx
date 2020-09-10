import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { allOrdersState } from 'store/orders';

import { MenuModal } from '../common';

import CurrencyExchange from './CurrencyExchange';

type NotificationsModalProps = {
	onDismiss: () => void;
};

export const NotificationsModal: FC<NotificationsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const allOrders = useRecoilValue(allOrdersState);

	const ORDER_GROUPS = useMemo(
		() => [
			{
				id: 'pending-orders',
				title: t('modals.notifications.open-orders.title'),
				data: allOrders.pending,
				noResults: t('modals.notifications.open-orders.no-results'),
			},
			{
				id: 'confirmed-orders',
				title: t('modals.notifications.recent-notifications.title'),
				data: allOrders.confirmed,
				noResults: t('modals.notifications.recent-notifications.no-results'),
			},
		],
		[allOrders, t]
	);

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.notifications.title')}>
			<OrdersContainer>
				{ORDER_GROUPS.map((group) => (
					<OrdersGroup key={group.id} className={group.id}>
						<OrdersGroupTitle>{group.title}</OrdersGroupTitle>
						<OrdersGroupList>
							{group.data.length ? (
								group.data.map((order) => (
									<OrdersGroupListItem>
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
			</OrdersContainer>
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

const OrdersContainer = styled.div``;
const OrdersGroup = styled.div`
	padding-bottom: 16px;
`;
const OrdersGroupTitle = styled.div`
	padding: 8px 16px;
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;
const OrdersGroupList = styled.div``;
const OrdersGroupListItem = styled.div`
	padding: 8px 16px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const NoResults = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

export default NotificationsModal;
