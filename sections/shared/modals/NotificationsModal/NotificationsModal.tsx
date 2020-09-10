import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { allOrdersState } from 'store/orders';

import FullScreen from './FullScreen';
import Popup from './Popup';

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
				title: isFullScreen
					? t('modals.notifications.all-notifications.title')
					: t('modals.notifications.recent-notifications.title'),
				data: isFullScreen ? allOrders.confirmed : allOrders.confirmed.slice(0, 4),
				noResults: t('modals.notifications.recent-notifications.no-results'),
			},
		],
		[allOrders, isFullScreen, t]
	);

	return isFullScreen ? (
		<FullScreen onDismiss={onDismiss} orderGroups={ORDER_GROUPS} />
	) : (
		<Popup onDismiss={onDismiss} orderGroups={ORDER_GROUPS} setIsFullScreen={setIsFullScreen} />
	);
};

export default NotificationsModal;
