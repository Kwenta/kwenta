import TabButton from 'components/Button/TabButton'

export default {
	title: 'FuturesTabs',
	component: <div />,
}

export const Default = () => {
	return (
		<div style={{ display: 'flex', gap: 10 }}>
			<TabButton title="Position" />
			<TabButton title="Orders" />
			<TabButton title="Trades" />
			<TabButton title="Transfers" />
		</div>
	)
}
