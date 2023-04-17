import { FC, memo } from 'react';
import styled from 'styled-components';

import { Body } from 'components/Text';

type CheckboxProps = {
	id: string;
	label: string;
	checked: boolean;
	onChange: () => void;
};

export const Checkbox: FC<CheckboxProps> = memo(({ id, label, checked, onChange, ...props }) => (
	<CheckboxContainer>
		<Input type="checkbox" id={id} name={id} checked={checked} onChange={onChange} {...props} />
		<Label htmlFor={id}>{<Body color="secondary">{label}</Body>}</Label>
	</CheckboxContainer>
));

const CheckboxContainer = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	display: flex;
	align-items: center;
	cursor: pointer;
`;

const Input = styled.input`
	-webkit-appearance: none;
	-moz-appearance: none;
	-o-appearance: none;
	appearance: none;

	background-color: var(--form-background);
	/* Not removed via appearance */
	margin: 0;
	margin-right: 6px;

	font: inherit;
	color: currentColor;
	width: 20px;
	height: 20px;
	border: 0.15em solid currentColor;
	border-radius: 3px;
	transform: translateY(-0.075em);

	display: grid;
	place-content: center;
	cursor: pointer;

	&::before {
		content: '';
		width: 0.75em;
		height: 0.75em;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
		transform: scale(0);
		transform-origin: bottom left;
		transition: 120ms transform ease-in-out;
		box-shadow: inset 1em 1em var(--form-control-color);
		/* Windows High Contrast Mode */
		background-color: white;
	}
	&:checked::before {
		transform: scale(1);
	}
`;

const Label = styled.label`
	cursor: pointer;
`;
