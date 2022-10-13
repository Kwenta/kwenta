import React from 'react';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';

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

const LabelWithInput: React.FC<LabelWithInputProps> = ({
	id,
	right,
	value,
	onChange,
	disabled,
	labelText,
	placeholder,
	defaultValue,
}) => (
	<>
		<LabelText>{labelText}</LabelText>
		<CustomInput
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
);

const LabelText = styled.p`
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
