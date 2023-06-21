import styled from 'styled-components';

type Props = {
	mobile?: boolean;
};

export default function ConditionalOrdersWarning({ mobile }: Props) {
	return (
		<OrdersWarning mobile={mobile}>
			Conditional orders are executed based on the onchain Chainlink price which can differ from the
			offchain prices displayed above.
		</OrdersWarning>
	);
}

const OrdersWarning = styled.div<{ mobile?: boolean }>`
	padding: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.warning};
	border-top: ${(props) =>
		props.mobile ? 'none' : props.theme.colors.selectedTheme.newTheme.border.style};
	border-bottom: ${(props) =>
		props.mobile ? props.theme.colors.selectedTheme.newTheme.border.style : 'none'};
	text-align: center;
`;
