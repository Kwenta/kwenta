import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';

import SegmentedControl from 'components/SegmentedControl';

export default {
	title: 'Components/SegmentedControl',
	component: SegmentedControl,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof SegmentedControl>;

const Template: ComponentStory<typeof SegmentedControl> = (args) => {
	const [currentTab, setCurrentTab] = useState(0);

	return (
		<SegmentedControl
			{...args}
			selectedIndex={currentTab}
			onChange={setCurrentTab}
			values={['One', 'Two', 'Three']}
		/>
	);
};

export const Default = Template.bind({});

export const CheckStyle = Template.bind({});

CheckStyle.args = {
	styleType: 'check',
};
