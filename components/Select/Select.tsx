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
				color: colors.common.primaryWhite,
				boxShadow: 'none',
				fontSize: '12px',
				border: 'none',
			}),
			control: (provided, state) => ({
				...provided,
				color: colors.common.primaryWhite,
				cursor: 'pointer',
				boxShadow: colors.selectedTheme.select.control.shadow,
				border: 'none',
				outline: 'none',
				minHeight: 'unset',
				height: state.selectProps.controlHeight ?? 'unset',
				'&:hover': {
					background: colors.selectedTheme.button.hover,
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
					WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					WebkitMaskComposite: 'xor',
					maskComposite: 'exclude',
				},
				fontSize: '12px',
				background: colors.selectedTheme.button.background,
				borderRadius: 10,
			}),
			menu: (provided, state) => ({
				...provided,
				background: colors.selectedTheme.cell.gradient,
				border: 'none',
				outline: 'none',
				borderRadius: 10,
				boxShadow: colors.selectedTheme.button.shadow,
				padding: 0,
				width: state.selectProps.menuWidth,
				right: 0,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 10,
				padding: 0,
				textAlign: 'left',
				border: colors.selectedTheme.cell.outline,
				borderStyle: 'solid',
				outline: 'none',
				'div.react-select__option:first-of-type:hover': {
					borderTopLeftRadius: '8px',
					borderTopRightRadius: '8px',
				},
				'div.react-select__option:last-of-type:hover': {
					borderBottomLeftRadius: '8px',
					borderBottomRightRadius: '8px',
				},
			}),
			option: (provided, state) => ({
				...provided,
				border: 'none',
				fontFamily: fonts.regular,
				color: state.isSelected ? colors.common.secondaryGold : colors.common.primaryWhite,
				cursor: 'pointer',
				fontSize: '12px',
				backgroundColor: 'transparent',
				padding: state.selectProps.optionPadding ?? '6px 8px',
				borderBottom: colors.selectedTheme.border,
				'&:hover': {
					background: colors.selectedTheme.cell.hover,
				},
				':last-child': {
					borderBottom: 'none',
				},
			}),
			placeholder: (provided) => ({
				...provided,
				fontSize: '12px',
				color: colors.common.primaryWhite,
			}),
			dropdownIndicator: (provided, state) => ({
				...provided,
				transition: 'transform 0.2s ease-in-out',
				transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
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
