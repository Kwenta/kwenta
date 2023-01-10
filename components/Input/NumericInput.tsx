import { ChangeEvent, FC, memo, useCallback } from 'react';
import styled, { css } from 'styled-components';

import Input from './Input';

type NumericInputProps = {
	value: string | number;
	placeholder?: string;
	onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
	className?: string;
	defaultValue?: any;
	disabled?: boolean;
	id?: string;
	bold?: boolean;
};

const INVALID_CHARS = ['-', '+', 'e'];

const NumericInput: FC<NumericInputProps> = memo(({ onChange, bold, ...props }) => {
	const handleOnChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;

			onChange(e, value.replace(/,/g, '.').replace(/[e+-]/gi, ''));
		},
		[onChange]
	);

	return (
		<StyledInput
			type="number"
			onChange={handleOnChange}
			onKeyDown={(e) => {
				if (INVALID_CHARS.includes(e.key)) {
					e.preventDefault();
				}
			}}
			min="0"
			step="any"
			$bold={bold}
			{...props}
		/>
	);
});

export const StyledInput = styled(Input)<{ $bold?: boolean }>`
	font-family: ${(props) => props.theme.fonts.mono};
	${(props) =>
		props.$bold &&
		css`
			font-family: ${props.theme.fonts.monoBold};
		`}
	text-overflow: ellipsis;
`;

export default NumericInput;
