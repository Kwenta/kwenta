import { Tooltip, ValueLabelProps, withStyles } from '@material-ui/core'

const TextOnlyTooltip = withStyles((theme) => ({
	tooltip: {
		// @ts-ignore theme.palette type
		color: theme.palette.colors.selectedTheme.text.value,
		marginTop: '1px',
		fontSize: '13px',
		backgroundColor: 'transparent',
	},
}))(Tooltip)

export default function ValueLabel(props: ValueLabelProps) {
	const { children, open, value } = props

	return (
		<TextOnlyTooltip open={open} enterTouchDelay={0} placement="bottom" title={value}>
			{children}
		</TextOnlyTooltip>
	)
}
