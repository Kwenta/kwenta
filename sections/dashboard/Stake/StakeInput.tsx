import { wei } from '@synthetixio/wei';
import { FC, useState } from 'react';
import styled from 'styled-components';
import { erc20ABI, useContractRead } from 'wagmi';

import CustomNumericInput from 'components/Input/CustomNumericInput';
import Connector from 'containers/Connector';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

type StakeInputProps = {
	label: string;
};

const kwentaTokenContract = {
	addressOrName: '0xDA0C33402Fc1e10d18c532F0Ed9c1A6c5C9e386C',
	contractInterface: erc20ABI,
};

const StakeInput: FC<StakeInputProps> = ({ label }) => {
	const { walletAddress } = Connector.useContainer();
	const [amount, setAmount] = useState('0');

	useContractRead({
		...kwentaTokenContract,
		functionName: 'balanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setAmount(Number(wei(data ?? zeroBN)).toFixed(4));
			} else {
				setAmount('0');
			}
		},
	});

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
