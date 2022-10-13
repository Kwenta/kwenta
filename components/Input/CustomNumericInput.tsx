import { ChangeEvent, FC } from 'react';
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

const CustomNumericInput: FC<CustomNumericInputProps> = ({
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
	const style = {
		'--numchs': value.length,
		'--suffix': `'${value.length === 0 ? '' : suffix}'`,
	};

	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const max = maxValue || 0;
		const valueIsAboveMax = max !== 0 && Number(value) > max;
		if (!valueIsAboveMax) {
			onChange(
				e,
				value
					.replace(/[^0-9.,]/g, '')
					.replace(/,/g, '.')
					.substring(0, 4)
			);
		}
	};

	return (
		<InputWrapper style={style as React.CSSProperties}>
			<StyledInput
				type="number"
				value={value}
				placeholder={placeholder + suffix}
				onChange={handleOnChange}
				className={className}
				defaultValue={defaultValue}
				disabled={disabled}
				id={id}
				{...rest}
			/>
		</InputWrapper>
	);
};

export const InputWrapper = styled.div`
	position: relative;
	overflow: hidden;
	::after {
		position: absolute;
		top: calc(25%);
		left: calc((var(--numchs) * 1ch + 1.3ch));
		//left: 5.3ch;
		content: var(--suffix, 'x');
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
