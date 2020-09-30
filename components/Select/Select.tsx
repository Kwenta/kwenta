import React, { FC, useContext, useMemo } from 'react';
import ReactSelect, { Props, StylesConfig } from 'react-select';
import { ThemeContext } from 'styled-components';

const IndicatorSeparator: FC = () => null;

function Select<T>(props: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext);

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (provided, state) => ({
				...provided,
				opacity: state.isDisabled ? 0.4 : 1,
				backgroundColor: colors.elderberry,
			}),
			singleValue: (provided) => ({
				...provided,
				color: colors.white,
				boxShadow: 'none',
				fontSize: '12px',
				border: 'none',
			}),
			control: (provided) => ({
				...provided,
				fontFamily: fonts.bold,
				color: colors.white,
				cursor: 'pointer',
				boxShadow: 'none',
				border: `1px solid ${colors.navy}`,
				borderRadius: '4px',
				outline: 'none',
				height: '24px',
				'&:hover': {
					border: `1px solid ${colors.navy}`,
				},
				fontSize: '12px',
				backgroundColor: colors.elderberry,
			}),
			menu: (provided) => ({
				...provided,
				backgroundColor: colors.elderberry,
				border: `1px solid ${colors.navy}`,
				boxShadow: 'none',
				padding: 0,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 0,
				padding: 0,
				textAlign: 'left',
			}),
			option: (provided) => ({
				...provided,
				fontFamily: fonts.bold,
				color: colors.white,
				cursor: 'pointer',
				fontSize: '12px',
				backgroundColor: colors.elderberry,
				'&:hover': {
					backgroundColor: colors.navy,
				},
			}),
			placeholder: (provided) => ({
				...provided,
				fontSize: '12px',
				color: colors.white,
			}),
			dropdownIndicator: (provided) => ({
				...provided,
				color: colors.goldColors.color1,
				'&:hover': {
					color: colors.goldColors.color3,
				},
			}),
		};
		return styles;
	}, [colors, fonts]);

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			components={{ IndicatorSeparator }}
			{...props}
		/>
	);
}

export default Select;
