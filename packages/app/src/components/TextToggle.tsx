import React from 'react'
import styled, { css } from 'styled-components'

import { FlexDiv, FlexDivCol } from 'components/layout/flex'
import { Body } from 'components/Text'

interface TextToggleProps<T> {
	title: string
	options: T[]
	selectedOption: T
	onOptionChange: (value: T) => void
}

const TextToggle: React.FC<TextToggleProps<any>> = ({
	title,
	options,
	selectedOption,
	onOptionChange,
}) => {
	return (
		<FlexDivCol>
			<Body color="secondary">{title}</Body>
			<FlexDiv columnGap="10px">
				{options.map((value) => (
					<ToggleButton
						key={value}
						$active={selectedOption === value}
						onClick={() => onOptionChange(value)}
					>
						{value}
					</ToggleButton>
				))}
			</FlexDiv>
		</FlexDivCol>
	)
}

const ToggleButton = styled(Body)<{ $active: boolean }>`
	cursor: pointer;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.disabled};

	${(props) =>
		props.$active &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.text.primary};
			font-family: ${(props) => props.theme.fonts.bold};
		`}
`

export default TextToggle
