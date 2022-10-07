import { FC, useState } from 'react';
import styled from 'styled-components';

import CustomNumericInput from 'components/Input/CustomNumericInput';

type StakeInputProps = {
	label: string;
	balance: string;
};

const StakeInput: FC<StakeInputProps> = ({ label, balance }) => {
	const [amount, setAmount] = useState(balance);

	return (
		<StakeInputContainer>
			<StakeInputHeader>
				<div>{label}</div>
				<div className="max">Max</div>
			</StakeInputHeader>
			<StyledInput
				value={amount}
				suffix=""
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
