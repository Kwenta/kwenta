import * as Text from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'

export default {
	title: 'Components/Tooltip',
	component: Tooltip,
}

export const Default = () => {
	return (
		<Tooltip height="auto" preset="fixed" content="This is the tooltip text">
			<Text.Body>Hover over this text</Text.Body>
		</Tooltip>
	)
}
