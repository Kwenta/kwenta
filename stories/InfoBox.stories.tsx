import { ComponentMeta, ComponentStory } from '@storybook/react';

import InfoBox from 'components/InfoBox';

export default {
	title: 'Components/InfoBox',
	component: InfoBox,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof InfoBox>;

const Template: ComponentStory<typeof InfoBox> = (args) => <InfoBox {...args} />;

export const Default = Template.bind({});

Default.args = {
	details: {
		'First key': {
			value: 'First value',
		},
		'Second key': {
			value: 'Second value',
		},
	},
};

export const Spaced = Template.bind({});

Spaced.args = {
	details: {
		'First key': {
			value: 'First value',
		},
		'Second key': {
			value: 'Second value',
			spaceBeneath: true,
		},
		'Third key': {
			value: 'Third value',
		},
	},
};
