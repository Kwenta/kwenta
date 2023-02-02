import { FC, memo } from 'react';
import styled from 'styled-components';

type NewNumericInputProps = {
	right?: React.ReactNode;
};

const NewNumericInput: FC<NewNumericInputProps> = memo(({ right }) => {
	return (
		<InputContainer>
			<input />
			{right && <div className="right">{right}</div>}
		</InputContainer>
	);
});

const InputContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: ${(props) => props.theme.colors.selectedTheme.input.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 0 10px;

	& > input {
		display: flex;
		flex: 1;
		font-size: 18px;
		background-color: transparent;
		border: none;
		text-overflow: ellipsis;
	}

	.right {
		margin-left: 4px;
	}
`;

export default NewNumericInput;
