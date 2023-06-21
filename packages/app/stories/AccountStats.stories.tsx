import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'

export default {
	title: 'Futures/AccountStats',
}

export const Default = () => {
	return (
		<div style={{ width: 334 }}>
			<InfoBoxContainer>
				<InfoBoxRow title="Available Margin" value="$27,192.98" />
				<InfoBoxRow title="Buying Power" value="$271,929.80" />
				<InfoBoxRow title="Margin Usage" value="10%" />
			</InfoBoxContainer>
		</div>
	)
}
