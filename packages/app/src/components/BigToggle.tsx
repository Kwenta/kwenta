import Image from 'next/image'
import { useCallback, useReducer } from 'react'
import styled, { css } from 'styled-components'

import { StyledCaretDownIcon } from './Select'

type BigToggleProps<T extends string> = {
	value: T
	options: T[]
	onOptionClick(value: T): void
	iconMap?: Record<T, string>
}

const BigToggle = <T extends string>({
	options,
	value,
	onOptionClick,
	iconMap,
}: BigToggleProps<T>) => {
	const [expanded, toggleExpanded] = useReducer((s) => !s, false)

	const handleOptionClick = useCallback(
		(option: T) => () => {
			onOptionClick(option)
			toggleExpanded()
		},
		[onOptionClick]
	)

	return (
		<BigToggleContainer>
			<BigToggleButton onClick={toggleExpanded}>
				{iconMap?.[value] && <Image alt={value} src={iconMap[value]} width={15} height={15} />}
				{value}
				<StyledCaretDownIcon $flip={expanded} style={{ marginLeft: 7 }} />
			</BigToggleButton>
			{expanded && (
				<BigToggleListContainer>
					{options
						.filter((o) => o !== value)
						.map((option) => (
							<BigToggleListOption key={option} onClick={handleOptionClick(option)}>
								{iconMap?.[option] && (
									<Image alt={option} src={iconMap[option]} width={15} height={15} />
								)}
								{option}
							</BigToggleListOption>
						))}
				</BigToggleListContainer>
			)}
		</BigToggleContainer>
	)
}

const BigToggleContainer = styled.div`
	position: relative;
`

const BigToggleButton = styled.button`
	display: flex;
	align-items: center;
	border-radius: 40px;
	padding: 7px;
	font-size: 16px;
	cursor: pointer;
	line-height: 1;

	img {
		margin-right: 7px;
	}

	${(props) => css`
		border: ${props.theme.colors.selectedTheme.newTheme.button.default.border};
		background-color: ${props.theme.colors.selectedTheme.newTheme.button.default.background};
		color: ${props.theme.colors.selectedTheme.newTheme.button.default.color};
	`}
`

const BigToggleListContainer = styled.div`
	position: absolute;
	top: 40px;
	border: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.border};
	border-radius: 8px;
	overflow: hidden;
	width: 100%;
`

const BigToggleListOption = styled.button`
	border: none;
	width: 100%;
	padding: 7px;
	cursor: pointer;
	line-height: 1;
	display: flex;

	img {
		margin-right: 7px;
	}

	${(props) => css`
		background-color: ${props.theme.colors.selectedTheme.newTheme.button.default.background};
		color: ${props.theme.colors.selectedTheme.newTheme.button.default.color};
		font-size: 16px;

		&:not(:last-of-type) {
			border-bottom: ${props.theme.colors.selectedTheme.newTheme.button.default.border};
		}

		&:hover {
			background-color: ${props.theme.colors.selectedTheme.newTheme.button.default.hover
				.background};
		}
	`}
`

export default BigToggle
