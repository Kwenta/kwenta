import { ComponentMeta } from '@storybook/react'
import { wei } from '@synthetixio/wei'

import StakeCard from 'components/StakeCard/StakeCard'

export default {
	title: 'Components/StakeCard',
	component: StakeCard,
	decorators: [
		(Story) => (
			<div style={{ width: 450 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof StakeCard>

export const Default = () => {
	return (
		<StakeCard
			title="Sample Token"
			stakeBalance={wei(0)}
			unstakeBalance={wei(0)}
			onStake={() => {}}
			onUnstake={() => {}}
			isApproved
		/>
	)
}
