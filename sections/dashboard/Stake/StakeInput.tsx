import Wei from '@synthetixio/wei';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CustomNumericInput from 'components/Input/CustomNumericInput';

type StakeInputProps = {
	label: string;
	maxBalance: Wei;
};

const StakeInput: FC<StakeInputProps> = ({ label, maxBalance }) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState('0');

	const onMaxClick = useCallback(async () => {
		setAmount(Number(maxBalance).toFixed(4));
	}, [maxBalance]);

	return (
		<StakeInputContainer>
			<StakeInputHeader>
				<div>{label}</div>
				<div className="max" onClick={onMaxClick}>
					{t('dashboard.stake.tabs.stake-table.max')}
				</div>
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
		cursor: pointer;
	}
`;

const StakeInputContainer = styled.div``;

const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default StakeInput;
