import styled from 'styled-components';

export const OrdersGroup = styled.div`
	padding-bottom: 16px;
`;
export const OrdersGroupTitle = styled.div`
	padding: 8px 16px;
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;
export const OrdersGroupList = styled.div``;
export const OrdersGroupListItem = styled.div`
	padding: 12px 16px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;
export const NoResults = styled.div`
	color: ${(props) => props.theme.colors.silver};
`;
