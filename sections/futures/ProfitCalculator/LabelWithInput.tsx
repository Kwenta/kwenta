import styled from 'styled-components';

const INVALID_CHARS = ['-', '+', 'e'];

export const LabelWithInput = (props: {
	id?: string;
	labelText: string;
	className?: string;
	placeholder: string;
	onChange?: any;
	disabled?: boolean;
	isPositionSize?: boolean;
	marketAsset?: string;
}) => {
	return (
		<>
			<LabelText>{props.labelText}</LabelText>
			<InputContainer className={props.className}>
				<StyledLabel>
					<StyledInput
						id={props.id}
						placeholder={props.placeholder}
						inputMode={'decimal'}
						onChange={props.onChange}
						type={'number'}
						disabled={props.disabled}
						step={props.isPositionSize ? '' : '0.01'}
						onKeyDown={(e) => {
							if (INVALID_CHARS.includes(e.key)) {
								e.preventDefault();
							}
						}}
					/>
					{/* {props.marketAsset ? <span>{props.marketAsset}</span> : ''} */}
				</StyledLabel>
			</InputContainer>
		</>
	);
};

const InputContainer = styled.div`
	width: ${(props) => (props.className ? '100%' : 'auto')};
	height: 46px;
`;

const StyledLabel = styled.label`
	display: flex;
	flex-direction: row;
`;

const StyledInput = styled.input`
	/* Rectangle 2050 */

	color: #ece8e3;
	width: 100%;
	height: 46px;

	background: linear-gradient(180deg, #101010 33.26%, rgba(24, 24, 24, 0.37) 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;
`;

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
