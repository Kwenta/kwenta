import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { allOrdersState } from 'store/orders';

import { MenuModal } from '../common';

import CurrencyExchange from './CurrencyExchange';
import { TextButton } from 'styles/common';

import { OrdersGroup, OrdersGroupTitle, OrdersGroupList, OrdersGroupListItem } from './common';
import FullScreenModal from 'components/FullScreenModal';
import Card from 'components/Card';

type NotificationsModalProps = {
	onDismiss: () => void;
};

export const NotificationsModal: FC<NotificationsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
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

	const Popup = () => (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.notifications.title')}>
			{ORDER_GROUPS.map((group) => (
				<OrdersGroup key={group.id} className={group.id}>
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
			{!isFullScreen && (
				<ViewAllButtonContainer>
					<ViewAllButton onClick={() => setIsFullScreen(true)}>
						{t('modals.notifications.view-all')}
					</ViewAllButton>
				</ViewAllButtonContainer>
			)}
		</StyledMenuModal>
	);

	const FullScreen = () => (
		<StyledFullScreenModal isOpen={true} title={t('modals.notifications.title')}>
			{ORDER_GROUPS.map((group) => (
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

	return isFullScreen ? <FullScreen /> : <Popup />;
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 8px 0 16px 0;
	}
`;

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

const NoResults = styled.div`
	color: ${(props) => props.theme.colors.white};
`;
const ViewAllButtonContainer = styled.div`
	margin: 0 auto;
	text-align: center;
`;
const ViewAllButton = styled(TextButton)`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default NotificationsModal;
