import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';

import { walletAddressState } from 'store/wallet';
import { ordersByStatusState } from 'store/orders';

import FullScreen from './FullScreen';
import Popup from './Popup';

type NotificationsModalProps = {
	onDismiss: () => void;
};

export const NotificationsModal: FC<NotificationsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
	const ordersByStatus = useRecoilValue(ordersByStatusState);
	const walletAddress = useRecoilValue(walletAddressState);

	const { useFeeReclaimPeriodsQuery, useRedeemableDeprecatedSynthsQuery } = useSynthetixQueries();

	const feeWaitingPeriodsQuery = useFeeReclaimPeriodsQuery(walletAddress ?? '');
	const feeWaitingPeriods = useMemo(() => feeWaitingPeriodsQuery.data ?? [], [
		feeWaitingPeriodsQuery.data,
	]);
	const hasWaitingPeriod = useMemo(() => !!feeWaitingPeriods.find((fw) => fw.waitingPeriod !== 0), [
		feeWaitingPeriods,
	]);

	const redeemableDeprecatedSynthsQuery = useRedeemableDeprecatedSynthsQuery(walletAddress);
	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;

	const hasRedeemableDeprecatedSynths = useMemo(
		() => !!redeemableDeprecatedSynths?.totalUSDBalance.gt(0),
		[redeemableDeprecatedSynths?.totalUSDBalance]
	);

	const orderGroups = useMemo(
		() => [
			{
				id: 'pending-orders',
				title: t('modals.notifications.open-orders.title'),
				data: ordersByStatus.pending,
				noResults: t('modals.notifications.open-orders.no-results'),
			},
			{
				id: 'confirmed-orders',
				title: isFullScreen
					? t('modals.notifications.all-notifications.title')
					: t('modals.notifications.recent-notifications.title'),
				data: isFullScreen ? ordersByStatus.confirmed : ordersByStatus.confirmed.slice(0, 4),
				noResults: t('modals.notifications.recent-notifications.no-results'),
			},
		],
		[ordersByStatus, isFullScreen, t]
	);

	return isFullScreen ? (
		<FullScreen
			{...{
				onDismiss,
				feeWaitingPeriods,
				hasWaitingPeriod,
				orderGroups,
				hasRedeemableDeprecatedSynths,
				redeemableDeprecatedSynthsQuery,
			}}
		/>
	) : (
		<Popup
			{...{
				onDismiss,
				feeWaitingPeriods,
				hasWaitingPeriod,
				orderGroups,
				setIsFullScreen,
				ordersByStatus,
				hasRedeemableDeprecatedSynths,
				redeemableDeprecatedSynthsQuery,
			}}
		/>
	);
};

export default NotificationsModal;
