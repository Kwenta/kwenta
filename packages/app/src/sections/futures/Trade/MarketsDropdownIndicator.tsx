import React from 'react'
import { components, IndicatorProps } from 'react-select'
import styled from 'styled-components'

import DropdownArrow from 'assets/svg/app/dropdown-arrow.svg'
import { MiniLoader } from 'components/Loader'

const MarketsDropdownIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<StyledDropdownArrow />
	</components.DropdownIndicator>
)

export const DropdownLoadingIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<MiniLoader />
	</components.DropdownIndicator>
)

const StyledDropdownArrow = styled(DropdownArrow)`
	path {
		fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export default MarketsDropdownIndicator
