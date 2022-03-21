import React, { FC, useContext, useMemo } from 'react';
import ReactSelect, { Props, StylesConfig } from 'react-select';
import { ThemeContext } from 'styled-components';

export const IndicatorSeparator: FC = () => null;

function Select<T>(props: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext);

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (provided, state) => ({
				...provided,
				opacity: state.isDisabled ? 0.4 : 1,
			}),
			singleValue: (provided) => ({
				...provided,
				color: colors.white,
				boxShadow: 'none',
				fontSize: '12px',
				border: 'none',
			}),
			control: (provided, state) => ({
				...provided,
				color: colors.white,
				cursor: 'pointer',
				boxShadow: colors.selectedTheme.select.control.shadow,

				border: 'none',
				outline: 'none',
				minHeight: 'unset',
				height: state.selectProps.controlHeight ?? 'unset',
				'&:hover': {
					background: colors.selectedTheme.button.hover
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					borderRadius: '10px',
					padding: '1px',
					background: 'rgb(255 255 255 / 10%)',
					'-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					'-webkit-mask-composite': 'xor',
					'mask-composite': 'exclude',
				},
				fontSize: '12px',
				background: colors.selectedTheme.button.background,
				borderRadius: 10,
			}),
			menu: (provided, state) => ({
				...provided,
				background: colors.selectedTheme.button.background,
				border: 'none',
				outline: 'none',
				borderRadius: 10,
				boxShadow: colors.selectedTheme.button.shadow,
				padding: 0,
				width: state.selectProps.menuWidth,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 10,
				padding: 0,
				textAlign: 'left',
				border: colors.selectedTheme.border,
				borderStyle:'solid',
				outline: 'none',
			}),
			option: (provided, state) => ({
				...provided,
				border: 'none',
				fontFamily: fonts.bold,
				color: state.isSelected ? colors.common.secondaryGold : colors.common.primaryWhite,
				cursor: 'pointer',
				fontSize: '12px',
				backgroundColor: 'transparent',
				padding: state.selectProps.optionPadding ?? '6px 8px',
				borderBottom: colors.selectedTheme.border,
				':last-child':{
					borderBottom: 'none',
				},
			}),
			placeholder: (provided) => ({
				...provided,
				fontSize: '12px',
				color: colors.white,
			}),
			dropdownIndicator: (provided, state) => ({
				...provided,
				transition: 'transform 0.2s ease-in-out',
				transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
				'&:hover': {
					color: state.selectProps.dropdownIndicatorColorHover ?? colors.goldColors.color3,
				},
			}),
			valueContainer: (provided) => ({
				...provided,
				height: '100%',
			}),
		};
		return styles;
	}, [colors, fonts]);

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			{...props}
			components={{ IndicatorSeparator, ...props.components }}
		/>
	);
}

export default Select;
