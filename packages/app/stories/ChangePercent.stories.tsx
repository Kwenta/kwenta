// import { StoryFn } from '@storybook/react';

import ChangePercent from 'components/ChangePercent'

export default {
	title: 'Components/ChangePercent',
	component: ChangePercent,
}

// const Template: StoryFn<typeof ChangePercent> = (args) => <ChangePercent {...args} />;

export const Default = () => {
	return (
		<div>
			<div>
				<ChangePercent value="2.88" />
			</div>
			<div>
				<ChangePercent value="-2.88" />
			</div>
			<div>
				<ChangePercent value="0.00" />
			</div>
		</div>
	)
}
