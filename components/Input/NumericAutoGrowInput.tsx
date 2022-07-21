import { ChangeEvent, FC, useState } from 'react';
import AutosizeInput from 'react-input-autosize';

type NumericAutoGrowInputProps = {
	value: string | number;
	min?: number;
	max?: number;
	step?: string;
	onChange: (e: ChangeEvent<HTMLInputElement>, value: number) => void;
};

const INVALID_CHARS = ['-', '+', 'e'];

const NumericAutoGrowInput: FC<NumericAutoGrowInputProps> = ({ value, onChange, ...rest }) => {
	const [noNumberSelected, setNoNumberSelected] = useState(isNaN(Number(value)));
	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const cleanedValue = parseFloat(value.replace(/,/g, '.').replace(/[e+-]/gi, ''));
		if (isNaN(cleanedValue)) {
			// Dont actually update leverage when no valid value is added.
			// Instead just set the noNumberSelected to true
			// This is needed to let users remove all leverage in the input.
			// If blurred with this state it will reuse the latest valid value
			setNoNumberSelected(true);
			return;
		}
		// AutosizeInput did not respect min and max passed as props
		if (rest.min && cleanedValue < rest.min) {
			return;
		}
		if (rest.max && cleanedValue > rest.max) {
			return;
		}
		setNoNumberSelected(false);
		onChange(e, cleanedValue);
	};

	return (
		<AutosizeInput
			{...rest}
			inputStyle={{
				border: 'none',
				outline: 'none',
				background: 'none',
				color: 'white',
				padding: 0,
			}}
			extraWidth={1}
			value={noNumberSelected ? '' : value}
			type="number"
			onChange={handleOnChange}
			onBlur={() => setNoNumberSelected(false)}
			onKeyDown={(e) => {
				if (INVALID_CHARS.includes(e.key)) {
					e.preventDefault();
				}
			}}
		/>
	);
};

export default NumericAutoGrowInput;
