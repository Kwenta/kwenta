import React from 'react';
import { components, IndicatorProps } from 'react-select';

import dropdownArrow from '../../../assets/svg/app/dropdown-arrow.svg';

const MarketsDropdownIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<img src={dropdownArrow} />
	</components.DropdownIndicator>
);

export default MarketsDropdownIndicator;
