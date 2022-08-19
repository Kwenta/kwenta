import styled from 'styled-components';

export const Checkbox = ({
	id,
	label,
	checked,
	onChange,
	...props
}: {
	id: string;
	label: string;
	checked: boolean;
	onChange: () => void;
}) => (
	<CheckboxContainer>
		<input type="checkbox" id={id} name={id} checked={checked} onChange={onChange} {...props} />
		<label htmlFor={id}>{label}</label>
	</CheckboxContainer>
);

const CheckboxContainer = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	display: flex;
	align-items: center;
`;
