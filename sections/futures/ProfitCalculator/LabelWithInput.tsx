import React from 'react';
import styled from 'styled-components';
import CustomInput from 'components/Input/CustomInput';
import NumericInput from 'components/Input/NumericInput';

type LabelWithInputProps = {
	disabled?: boolean;
	id?: string;
	labelText: string;
	placeholder: string;
	right?: any;
	onChange?: any;
	defaultValue?: any;
};

const LabelWithInput: React.FC<LabelWithInputProps> = ({
	id,
	right,
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
			disabled={disabled}
			onChange={onChange}
			placeholder={placeholder}
			className={'profit-calc'}
			defaultValue={defaultValue}
		/>
	</>
);

const LabelText = styled.p`
	width: 100.91px;
	height: 12px;
	left: 479px;
	top: 329px;

	margin-left: 12.1px;

	font-weight: 400;
	font-size: 12px;
	line-height: 12px;

	color: #ece8e3;
`;

export default LabelWithInput;
