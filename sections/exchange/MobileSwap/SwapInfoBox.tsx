import React from 'react';
import InfoBox from 'components/InfoBox';

const SwapInfoBox = () => {
	return (
		<InfoBox
			details={{
				Fee: { value: '' },
				'Gas Fee/Cost': { value: '' },
				'USD Value': { value: '' },
				Total: { value: '' },
			}}
		/>
	);
};

export default SwapInfoBox;
