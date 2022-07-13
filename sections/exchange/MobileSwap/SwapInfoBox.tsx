import React from 'react';
import styled from 'styled-components';
import InfoBox from 'components/InfoBox';

const SwapInfoBox: React.FC = () => {
	return (
		<StyledInfoBox
			details={{
				Fee: { value: '' },
				'Gas Fee/Cost': { value: '' },
				'USD Value': { value: '' },
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 15px;
`;

export default SwapInfoBox;
