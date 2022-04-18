import React from 'react';
import { components, IndicatorProps } from 'react-select';
import Image from 'next/image';
import dropdownArrow from '../../../assets/svg/app/dropdown-arrow.svg';

const MarketsDropdownIndicator: React.FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<Image src={dropdownArrow} />
	</components.DropdownIndicator>
);

export default MarketsDropdownIndicator;
