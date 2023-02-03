import { ChangeEvent, FC, memo } from 'react';
import styled from 'styled-components';

import Input from './Input';

type CustomNumericInputProps = {
	value: string;
	placeholder?: string;
	suffix: string;
	onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
	className?: string;
	defaultValue?: any;
	maxValue?: number;
	disabled?: boolean;
	id?: string;
};

const CustomNumericInput: FC<CustomNumericInputProps> = memo(
	({
		value,
		placeholder,
		suffix,
		onChange,
		className,
		defaultValue,
		maxValue,
		disabled,
		id,
		...rest
	}) => {
		const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			const standardizedNum = value
				.replace(/[^0-9.,]/g, '')
				.replace(/,/g, '.')
				.substring(0, 4);
			if (isNaN(Number(standardizedNum))) return;
			const max = maxValue || 0;
			const valueIsAboveMax = max !== 0 && Number(standardizedNum) > max;
			if (!valueIsAboveMax) {
				onChange(e, standardizedNum);
			}
		};

		return (
			<InputWrapper $length={value.length} $suffix={suffix}>
				<StyledInput
					type="text"
					inputMode="decimal"
					value={value}
					placeholder={placeholder ? `${placeholder} ${suffix}` : suffix}
					onChange={handleOnChange}
					className={className}
					defaultValue={defaultValue}
					disabled={disabled}
					id={id}
					{...rest}
				/>
			</InputWrapper>
		);
	}
);

export const InputWrapper = styled.div<{ $length: number; $suffix: string }>`
	position: relative;
	overflow: hidden;
	::after {
		position: absolute;
		top: calc(25%);
		left: calc(${(props) => props.$length} * 1ch + 1.3ch));
		content: var(${(props) => (props.$length === 0 ? '' : props.$suffix)});
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 18px;
		color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
	}
`;

export const StyledInput = styled(Input)`
	font-family: ${(props) => props.theme.fonts.mono};
	text-overflow: ellipsis;
`;

export default CustomNumericInput;
