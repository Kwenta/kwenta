import { ComponentMeta, ComponentStory } from '@storybook/react';

import Badge from 'components/Badge';

export default {
	title: 'Components/Badge',
	component: Badge,
} as ComponentMeta<typeof Badge>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args}>Badge</Badge>;

export const Default = Template.bind({});

export const Dark = Template.bind({});

Dark.args = {
	dark: true,
};

export const Gray = Template.bind({});

Gray.args = {
	color: 'gray',
};

export const Red = Template.bind({});

Red.args = {
	color: 'red',
};
