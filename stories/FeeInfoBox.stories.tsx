import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';

export const FeeInfoBox = () => {
	return (
		<InfoBoxContainer>
			<InfoBoxRow title="Protocol Fee" keyNode="0.45%" value="$100,000.00" />
			<InfoBoxRow title="Limit / Stop Fee" value="$100,000,00" />
			<InfoBoxRow title="Cross Margin Fee" keyNode="0.02%" value="$100,000.00" spaceBeneath />
			<InfoBoxRow title="Total Fee" value="$100,000.00" />
			<InfoBoxRow title="Keeper Deposit" value="0.0100 ETH" />
		</InfoBoxContainer>
	);
};
