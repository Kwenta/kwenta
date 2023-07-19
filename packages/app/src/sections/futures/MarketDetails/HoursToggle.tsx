import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { StyledCaretDownIcon } from 'components/Select'
import { FUNDING_RATE_PERIODS } from 'constants/funding'
import { HOURS_TOGGLE_HEIGHT, HOURS_TOGGLE_WIDTH, zIndex } from 'constants/ui'
import { setSelectedInputFundingRateHour } from 'state/futures/reducer'
import { selectSelectedInputHours } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import media from 'styles/media'

const HoursToggle: React.FC = () => {
	const dispatch = useAppDispatch()
	const fundingHours = useAppSelector(selectSelectedInputHours)
	const [open, setOpen] = useState(false)
	const getLabelByValue = (value: number): string => FUNDING_RATE_PERIODS[value] ?? '1H'
	const updatePeriod = useCallback(
		(v: number) => {
			dispatch(setSelectedInputFundingRateHour(v))
			setOpen(!open)
		},
		[dispatch, open]
	)
	return (
		<ToggleContainer open={open}>
			<ToggleTable>
				<ToggleTableHeader
					style={{ borderBottomWidth: open ? '1px' : '0' }}
					onClick={() => setOpen(!open)}
				>
					{getLabelByValue(fundingHours)}
					<StyledCaretDownIcon width={12} $flip={open} />
				</ToggleTableHeader>
				{open && (
					<ToggleTableRows>
						{Object.entries(FUNDING_RATE_PERIODS).map(([key, value]) => (
							<ToggleTableRow key={key} onClick={() => updatePeriod(Number(key))}>
								{value}
							</ToggleTableRow>
						))}
					</ToggleTableRows>
				)}
			</ToggleTable>
		</ToggleContainer>
	)
}
//  solid ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
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
	height: ${HOURS_TOGGLE_HEIGHT};
	border-bottom-style: solid;
	border-bottom-color: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
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
	width: ${HOURS_TOGGLE_WIDTH};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
`

const ToggleContainer = styled.div<{ open: boolean }>`
	margin-left: 8px;
	cursor: pointer;
	margin-top: ${(props) => (props.open ? '84px' : '12px')};

	${media.lessThan('lg')`
               position: absolute;
               right: -50px;
               z-index: ${zIndex.HEADER};
               width: ${HOURS_TOGGLE_WIDTH};
       `}
`

export default HoursToggle
