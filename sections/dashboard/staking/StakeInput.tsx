import { useState } from 'react';
import styled from 'styled-components';

import CustomNumericInput from 'components/Input/CustomNumericInput';

const StakeInput = () => {
	const [amount, setAmount] = useState('');

	return (
		<StakeInputContainer>
			<StakeInputHeader style={{}}>
				<div>eKWENTA</div>
				<div className="max">Max</div>
			</StakeInputHeader>
			<StyledInput
				value={amount}
				suffix="($222.39)"
				onChange={(_, newValue) => {
					setAmount(newValue);
				}}
			/>
		</StakeInputContainer>
	);
};

const StakeInputHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	font-size: 14px;

	.max {
		text-transform: uppercase;
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

const StakeInputContainer = styled.div``;

const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default StakeInput;
