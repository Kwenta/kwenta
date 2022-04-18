import styled from 'styled-components';
import CustomInput from '../../../components/Input/CustomInput';

export const LabelWithInput = (props: {
	value?: any;
	right?: any;
	style?: any;
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
				value={props.value}
				placeholder={props.placeholder}
				right={props.right}
				style={props.style}
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

	font-weight: 400;
	font-size: 12px;
	line-height: 12px;

	color: #ece8e3;
`;

export default LabelWithInput;
