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

				border: colors.selectedTheme.border,
				outline: 'none',
				minHeight: 'unset',
				height: state.selectProps.controlHeight ?? 'unset',
				'&:hover': {
					border: colors.selectedTheme.border,
				},
				fontSize: '12px',
				background: colors.selectedTheme.button.background,
				borderRadius: '16px',
			}),
			menu: (provided, state) => ({
				...provided,
				background: colors.selectedTheme.button.background,
				border: colors.selectedTheme.border,
				borderRadius: '8px',
				boxShadow: colors.selectedTheme.button.shadow,
				padding: 0,
				width: state.selectProps.menuWidth,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 0,
				padding: 0,
				textAlign: 'left',
			}),
			option: (provided, state) => ({
				...provided,
				border: colors.selectedTheme.border,
				fontFamily: fonts.bold,
				color: state.isSelected ? colors.common.secondaryGold : colors.common.primaryWhite,
				cursor: 'pointer',
				fontSize: '12px',
				backgroundColor: 'transparent',
				padding: state.selectProps.optionPadding ?? '6px 8px',
				borderBottom: state.selectProps.optionBorderBottom,
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
