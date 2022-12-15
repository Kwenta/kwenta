import { ComponentStory } from '@storybook/react';

import SegmentedControl from 'components/SegmentedControl';

export default {
	title: 'Components/SegmentedControl',
	component: SegmentedControl,
};

const Template: ComponentStory<typeof SegmentedControl> = (args) => <SegmentedControl {...args} />;

export const Default = Template.bind({});
