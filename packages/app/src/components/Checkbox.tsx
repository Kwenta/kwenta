import { FC, memo } from 'react'
import styled, { css } from 'styled-components'

import { Body } from 'components/Text'

type CheckboxProps = {
	id: string
	label: string
	checked: boolean
	checkSide?: 'left' | 'right'
	variant?: 'tick' | 'fill'
	color?: 'default' | 'yellow'
	onChange: () => void
}

export const Checkbox: FC<CheckboxProps> = memo(
	({
		id,
		label,
		checked,
		color = 'default',
		onChange,
		checkSide = 'left',
		variant = 'tick',
		...props
	}) => (
		<CheckboxContainer color={color}>
			{checkSide === 'left' && (
				<div>
					<Input
						type="checkbox"
						id={id}
						name={id}
						color={color}
						checked={checked}
						onChange={onChange}
						variant={variant}
						{...props}
					/>
				</div>
			)}
			<LabelContainer>
				<Label htmlFor={id}>{<Body color={'preview'}>{label}</Body>}</Label>
			</LabelContainer>
			{checkSide === 'right' && (
				<div>
					<Input
						color={color}
						type="checkbox"
						id={id}
						name={id}
						checked={checked}
						onChange={onChange}
						variant={variant}
						{...props}
					/>
				</div>
			)}
		</CheckboxContainer>
	)
)

const CheckboxContainer = styled.div<{ color: 'default' | 'yellow' }>`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.checkBox[props.color].text}};
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	gap: 8px;
`

const LabelContainer = styled.div``

const Input = styled.input<{ variant: 'tick' | 'fill'; color: 'yellow' | 'default' }>`
	-webkit-appearance: none;
	-moz-appearance: none;
	-o-appearance: none;
	appearance: none;
	flex: 1;

	background-color: var(--form-background);
	margin: 0;

	font: inherit;
	color: currentColor;
	width: 22px;
	height: 22px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.checkBox[props.color].border};
	border-radius: 3px;

	display: grid;
	place-content: center;
	cursor: pointer;

	&::before {
		content: '';
		width: 0.8em;
		height: 0.8em;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
		transform: scale(0);
		transform-origin: bottom left;
		box-shadow: inset 1em 1em var(--form-control-color);
		background-color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	&:checked::before {
		transform: scale(1);
	}

	${(props) =>
		props.variant === 'fill' &&
		css`
			background-color: ${(props) =>
				props.theme.colors.selectedTheme.newTheme.checkBox.default.background};
			width: 13px;
			height: 13px;
			border-radius: 4px;

			&::before {
				clip-path: none;
			}
			&:checked::before {
				background-color: ${props.theme.colors.selectedTheme.newTheme.checkBox.default.checked};
				border-radius: 4px;
			}
		`}
`

const Label = styled.label`
	cursor: pointer;
`
