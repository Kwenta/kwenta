import React from 'react';
import { components, IndicatorProps } from 'react-select';
import { Svg } from 'react-optimized-image';
import dropdownArrow from '../../../assets/svg/app/dropdown-arrow.svg';

const MarketsDropdownIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<Svg src={dropdownArrow} />
	</components.DropdownIndicator>
);

export default MarketsDropdownIndicator;
