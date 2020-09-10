import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TextButton } from 'styles/common';

import { MenuModal } from '../common';

import CurrencyExchange from './CurrencyExchange';

import {
	OrdersGroup,
	OrdersGroupTitle,
	OrdersGroupList,
	OrdersGroupListItem,
	NoResults,
} from './common';

import { OrderGroup } from './types';

type PopupProps = {
	onDismiss: () => void;
	setIsFullScreen: (flag: boolean) => void;
	orderGroups: OrderGroup[];
};

export const Popup: FC<PopupProps> = ({ onDismiss, orderGroups, setIsFullScreen }) => {
	const { t } = useTranslation();

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.notifications.title')}>
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
			<ViewAllButtonContainer>
				<ViewAllButton onClick={() => setIsFullScreen(true)}>
					{t('modals.notifications.view-all')}
				</ViewAllButton>
			</ViewAllButtonContainer>
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
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default Popup;
