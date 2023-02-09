import InfoBox from 'components/InfoBox';

export const FeeInfoBox = () => {
	return (
		<InfoBox
			details={{
				'Protocol Fee: 0.45%': {
					value: '$100,000.00',
				},
				'Limit / Stop Fee': {
					value: '$100,000.00',
				},
				'Cross Margin Fee: 0.02%': {
					value: '$100,000.00',
					spaceBeneath: true,
				},
				'Total Fee': {
					value: '$100,000.00',
				},
				'Keeper Deposit': {
					value: '0.0100 ETH',
				},
			}}
		/>
	);
};
