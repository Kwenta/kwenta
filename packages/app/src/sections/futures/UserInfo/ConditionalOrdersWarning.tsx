import Link from 'next/link'
import styled from 'styled-components'

type Props = {
	mobile?: boolean
}

export default function ConditionalOrdersWarning({ mobile }: Props) {
	return (
		<OrdersWarning mobile={mobile}>
			Conditional orders are executed based on the onchain Pyth or Chainlink price. See the{' '}
			<Link
				href="https://mirror.xyz/kwenta.eth/kzfQhQL-53VhVttQcIvjWAZxgLO-DgIRWqL6ln1xYJ0"
				target="_blank"
			>
				blog post
			</Link>{' '}
			for more details.
		</OrdersWarning>
	)
}

const OrdersWarning = styled.div<{ mobile?: boolean }>`
	padding: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.warning};
	border-top: ${(props) =>
		props.mobile ? 'none' : props.theme.colors.selectedTheme.newTheme.border.style};
	border-bottom: ${(props) =>
		props.mobile ? props.theme.colors.selectedTheme.newTheme.border.style : 'none'};
	text-align: center;
`
