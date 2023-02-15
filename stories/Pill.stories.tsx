import { ComponentMeta, ComponentStory } from '@storybook/react';

import Pill from 'components/Pill';

export default {
	title: 'Components/Pill',
	component: Pill,
} as ComponentMeta<typeof Pill>;

const Template: ComponentStory<typeof Pill> = (args) => <Pill {...args}>Button</Pill>;

export const Default = Template.bind({});
