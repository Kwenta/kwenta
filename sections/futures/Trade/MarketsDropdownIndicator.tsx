import React from 'react';
import { components, IndicatorProps } from 'react-select';
import DropdownArrow from '../../../assets/svg/app/dropdown-arrow.svg';

const MarketsDropdownIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<DropdownArrow />
	</components.DropdownIndicator>
);

export default MarketsDropdownIndicator;
