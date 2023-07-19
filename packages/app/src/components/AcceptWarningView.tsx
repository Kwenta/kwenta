import styled from 'styled-components'

import { Checkbox } from 'components/Checkbox'

type Props = {
	checked: boolean
	message: string
	style?: Record<string, string>
	id?: string
	onChangeChecked: (checked: boolean) => void
}

export default function AcceptWarningView({ checked, id, onChangeChecked, style, message }: Props) {
	return (
		<Container style={style}>
			<Checkbox
				id={id ?? 'accept-warning'}
				data-testid={id}
				label={message}
				checkSide="right"
				checked={checked}
				color="yellow"
				onChange={() => onChangeChecked(!checked)}
			/>
		</Container>
	)
}

const Container = styled.div<{ style?: Record<string, string> }>`
	color: ${(props) => props.theme.colors.selectedTheme.button.yellow.text};
	font-size: 12px;
	margin: ${(props) => props.style?.margin ?? '0'};
	padding: 15px;
	border: 1px solid rgba(239, 104, 104, 0);
	background: ${(props) => props.theme.colors.selectedTheme.button.yellow.fill};
	border-radius: 8px;
	cursor: default;
`
