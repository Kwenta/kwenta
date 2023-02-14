import { ComponentMeta, ComponentStory } from '@storybook/react';

import Badge from 'components/Badge';

export default {
	title: 'Components/Badge',
	component: Badge,
} as ComponentMeta<typeof Badge>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const Default = Template.bind({});
