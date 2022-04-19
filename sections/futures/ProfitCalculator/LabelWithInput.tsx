import styled from 'styled-components';
import CustomInput from '../../../components/Input/CustomInput';

export const LabelWithInput = (props: {
	defaultValue?: any;
	right?: any;
	id?: string;
	onChange?: any;
	labelText: string;
	disabled?: boolean;
	placeholder: string;
}) => {
	return (
		<>
			<LabelText>{props.labelText}</LabelText>
			<CustomInput
				id={props.id}
				defaultValue={props.defaultValue}
				placeholder={props.placeholder}
				right={props.right}
				className={'profit-calc'}
				disabled={props.disabled}
				onChange={props.onChange}
			/>
		</>
	);
};

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
