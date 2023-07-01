// import { Tooltip, ValueLabelProps, withStyles } from '@material-ui/core'
import { SliderValueLabelSlotProps } from '@mui/base'
import styled from 'styled-components'

import { Body } from 'components/Text'

const ValueLabelText = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
`

// const TextOnlyTooltip = withStyles((theme) => ({
// 	tooltip: {
// 		// @ts-ignore theme.palette type
// 		color: theme.palette.colors.selectedTheme.text.value,
// 		marginTop: '1px',
// 		fontSize: '13px',
// 		backgroundColor: 'transparent',
// 	},
// }))(Tooltip)

export default function ValueLabel(props: SliderValueLabelSlotProps) {
	const { children, open } = props

	return <ValueLabelText>{children}</ValueLabelText>
}
