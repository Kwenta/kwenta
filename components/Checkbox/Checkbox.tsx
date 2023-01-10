import { FC, memo } from 'react';
import styled from 'styled-components';

type CheckboxProps = {
	id: string;
	label: string;
	checked: boolean;
	onChange: () => void;
};

export const Checkbox: FC<CheckboxProps> = memo(({ id, label, checked, onChange, ...props }) => (
	<CheckboxContainer>
		<input type="checkbox" id={id} name={id} checked={checked} onChange={onChange} {...props} />
		<label htmlFor={id}>{label}</label>
	</CheckboxContainer>
));

const CheckboxContainer = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	display: flex;
	align-items: center;
`;
