import { Meta } from '@storybook/react'

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'

export default {
	title: 'Components/InfoBox',
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<any>

export const Default = () => {
	return (
		<InfoBoxContainer>
			<InfoBoxRow title="First key" textValue="First value" />
			<InfoBoxRow title="Second key" textValue="Second value" />
		</InfoBoxContainer>
	)
}

export const Spaced = () => {
	return (
		<InfoBoxContainer>
			<InfoBoxRow title="First key" textValue="First value" />
			<InfoBoxRow title="Second key" textValue="Second value" spaceBeneath />
			<InfoBoxRow title="Third key" textValue="Third value" />
		</InfoBoxContainer>
	)
}
