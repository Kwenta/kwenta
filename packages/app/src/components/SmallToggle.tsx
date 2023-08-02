import { useCallback, useReducer } from 'react'
import styled from 'styled-components'

import { StyledCaretDownIcon } from 'components/Select'
import { HOURS_TOGGLE_HEIGHT, zIndex } from 'constants/ui'

// TODO: This component is not generic enough.
// This is because it will most likely be removed in favour of react-select.

type SmallToggleProps<T extends string> = {
	value: T
	options: T[]
	getLabelByValue?: (value: T) => string
	iconMap?: Record<T, React.ReactNode>
	onOptionClick: (value: T) => void
}

const SmallToggle = <T extends string>({
	value,
	options,
	getLabelByValue,
	iconMap,
	onOptionClick,
}: SmallToggleProps<T>) => {
	const [open, toggleOpen] = useReducer((o) => !o, false)

	const handleOptionClick = useCallback(
		(option: T) => () => {
			onOptionClick(option)
			toggleOpen()
		},
		[onOptionClick, toggleOpen]
	)

	return (
		<ToggleContainer open={open}>
			<ToggleTable>
				<ToggleTableHeader style={{ borderBottomWidth: open ? '1px' : '0' }} onClick={toggleOpen}>
					{iconMap?.[value]}
					{getLabelByValue?.(value) ?? value}
					<StyledCaretDownIcon width={12} $flip={open} style={{ marginLeft: 2 }} />
				</ToggleTableHeader>
				{open && (
					<ToggleTableRows>
						{options.map((option) => (
							<ToggleTableRow key={option} onClick={handleOptionClick(option)}>
								{option}
							</ToggleTableRow>
						))}
					</ToggleTableRows>
				)}
			</ToggleTable>
		</ToggleContainer>
	)
}

const ToggleTableRow = styled.div`
	margin: auto;
	padding: 1.5px 6px;
	height: ${HOURS_TOGGLE_HEIGHT};
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].background};
	border-width: 0px;

	:last-child {
		border-radius: 0px 0px 9px 9px;
	}

	:hover {
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
		background: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.pill['gray'].hover.background};
		:last-child {
			border-radius: 0px 0px 9px 9px;
		}
	}
`

const ToggleTableRows = styled.div`
	> div:not(:last-child) {
		border-bottom: 1px solid
			${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
	}
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	z-index: ${zIndex.HEADER};
`

const ToggleTableHeader = styled.div`
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	border-bottom-style: solid;
	border-bottom-color: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
	padding: 3px 5px;
	font-size: 12px;
`

const ToggleTable = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].background};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	:first-child {
		border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
	}
	border-radius: 9px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
`

const ToggleContainer = styled.div<{ open: boolean }>`
	margin-left: 8px;
	cursor: pointer;

	position: absolute;
	z-index: ${zIndex.HEADER};
`

export default SmallToggle
