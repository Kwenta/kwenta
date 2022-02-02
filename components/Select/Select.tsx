import React, { FC, useContext, useMemo } from 'react';
import ReactSelect, { components, Props, StylesConfig, IndicatorProps } from 'react-select';
import { ThemeContext } from 'styled-components';
import { Svg } from 'react-optimized-image';
import dropdownArrow from '../../assets/svg/app/dropdown-arrow.svg';

export const IndicatorSeparator: FC = () => null;

export const DropdownIndicator: FC<IndicatorProps<any>> = (props) => (
	<components.DropdownIndicator {...props}>
		<Svg src={dropdownArrow} />
	</components.DropdownIndicator>
);

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
				boxShadow: colors.current.select.control.shadow,

				border: colors.current.border,
				outline: 'none',
				minHeight: 'unset',
				height: state.selectProps.controlHeight ?? 'unset',
				'&:hover': {
					border: colors.current.border,
				},
				fontSize: '12px',
				background: colors.current.button.background,
				borderRadius: '16px',
			}),
			menu: (provided, state) => ({
				...provided,
				background: 'linear-gradient(180deg, #39332D 0%, #2D2A28 100%)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				borderRadius: '8px',
				boxShadow: colors.current.button.shadow,
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
				marginRight: '22px',
			}),
			valueContainer: (provided) => ({
				...provided,
				height: '100%',
			}),
			...props.styles,
		};
		return styles;
	}, [colors, fonts, props]);

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			{...props}
			components={{ IndicatorSeparator, DropdownIndicator, ...props.components }}
		/>
	);
}

export default Select;
