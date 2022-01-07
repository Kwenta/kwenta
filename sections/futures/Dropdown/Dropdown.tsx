import React from 'react';
import Select, { Props, StylesConfig } from 'react-select';
import { Svg } from 'react-optimized-image';
import dropdownArrow from 'assets/svg/futures/dropdown-arrow.svg';

function Dropdown<T>(props: Props<T>) {
	const styles = React.useMemo(() => {
		return {
			container: (provided) => ({
				...provided,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '12px 24px 12px 14px',
				borderRadius: '16px',
				background: 'linear-gradient(180deg, #39332d 0%, #2d2a28 100%)',
				height: '55px',
			}),
		} as StylesConfig;
	}, []);

	return (
		<Select
			styles={styles}
			components={{ DropdownIndicator: () => <Svg src={dropdownArrow} /> }}
			{...props}
		/>
	);
}

export default Dropdown;
