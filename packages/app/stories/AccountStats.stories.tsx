import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'

export default {
	title: 'Futures/AccountStats',
	component: <div />,
}

export const Default = () => {
	return (
		<div style={{ width: 334 }}>
			<InfoBoxContainer>
				<InfoBoxRow title="Available Margin" textValue="$27,192.98" />
				<InfoBoxRow title="Buying Power" textValue="$271,929.80" />
				<InfoBoxRow title="Margin Usage" textValue="10%" />
			</InfoBoxContainer>
		</div>
	)
}
