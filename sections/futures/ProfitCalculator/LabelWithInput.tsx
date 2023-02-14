import React, { memo } from 'react';
import styled from 'styled-components';

import NumericInput from 'components/Input/NumericInput';
import { Body } from 'components/Text';

type LabelWithInputProps = {
	disabled?: boolean;
	id?: string;
	labelText: string;
	placeholder?: string;
	right?: any;
	value?: any;
	onChange?: any;
	defaultValue?: any;
};

const LabelWithInput: React.FC<LabelWithInputProps> = memo(
	({ id, right, value, onChange, disabled, labelText, placeholder, defaultValue }) => (
		<>
			<LabelText>{labelText}</LabelText>
			<NumericInput
				id={id}
				right={right}
				value={value}
				disabled={disabled}
				onChange={onChange}
				placeholder={placeholder}
				defaultValue={defaultValue}
				style={{ display: '', flex: '', width: '100%' }}
			/>
		</>
	)
);

const LabelText = styled(Body)`
	width: 100.91px;
	height: 12px;
	left: 479px;
	top: 329px;
	margin-left: 12.1px;
	font-size: 12px;
	line-height: 12px;

	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export default LabelWithInput;
