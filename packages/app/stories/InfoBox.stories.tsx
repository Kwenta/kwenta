import { ComponentMeta } from '@storybook/react';

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';

export default {
	title: 'Components/InfoBox',
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<any>;

export const Default = () => {
	return (
		<InfoBoxContainer>
			<InfoBoxRow title="First key" value="First value" />
			<InfoBoxRow title="Second key" value="Second value" />
		</InfoBoxContainer>
	);
};

export const Spaced = () => {
	return (
		<InfoBoxContainer>
			<InfoBoxRow title="First key" value="First value" />
			<InfoBoxRow title="Second key" value="Second value" spaceBeneath />
			<InfoBoxRow title="Third key" value="Third value" />
		</InfoBoxContainer>
	);
};
