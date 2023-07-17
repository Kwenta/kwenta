import React, { FC, useContext, useMemo } from 'react'
import ReactSelect, { OptionTypeBase, Props, StylesConfig, components } from 'react-select'
import styled, { css, ThemeContext } from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down.svg'

export const IndicatorSeparator: FC = () => null

export const DropdownIndicator = (props: any) => {
	return (
		<components.DropdownIndicator {...props}>
			<StyledCaretDownIcon />
		</components.DropdownIndicator>
	)
}

export const StyledCaretDownIcon = styled(CaretDownIcon)<{ $flip?: boolean }>`
	width: 11px;
	${(props) => css`
		transform: ${props.$flip ? 'rotate(180deg)' : 'none'};
		color: ${props.theme.colors.selectedTheme.gray};
	`}
`

function Select<T extends OptionTypeBase>({ variant, ...props }: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext)

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (provided, state) => ({
				...provided,
				opacity: state.isDisabled ? 0.4 : 1,
			}),
			singleValue: (provided) => ({
				...provided,
				color: colors.selectedTheme.button.text.primary,
				boxShadow: 'none',
				fontSize: '12px',
				border: 'none',
				margin: 0,
				maxWidth: 'unset',
			}),
			control: (provided, state) => ({
				...provided,
				color: colors.selectedTheme.button.text.primary,
				cursor: 'pointer',
				boxShadow: variant === 'gradient' ? colors.selectedTheme.button.shadow : 'none',
				border: variant === 'flat' ? colors.selectedTheme.border : 'none',
				outline: 'none',
				minHeight: 'unset',
				height: state.selectProps.controlHeight ?? 'unset',
				'&:hover': {
					background:
						variant === 'flat' || variant === 'transparent'
							? colors.selectedTheme.button.fillHover
							: colors.selectedTheme.button.hover,
				},
				'&::before': variant === 'gradient' && {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					borderRadius: 8,
					padding: 1,
					background: colors.selectedTheme.button.border,
					WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					WebkitMaskComposite: 'xor',
					maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					maskComposite: 'exclude',
				},
				fontSize: '12px',
				background:
					variant === 'transparent'
						? 'none'
						: colors.selectedTheme.newTheme.button.default.background,
				borderRadius: variant === 'transparent' ? 30 : 8,
			}),
			menu: (provided, state) => ({
				...provided,
				background: colors.selectedTheme.cell.fill,
				border: 'none',
				outline: 'none',
				borderRadius: 8,
				boxShadow: colors.selectedTheme.button.shadow,
				padding: 0,
				width: state.selectProps.menuWidth,
				right: 0,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 8,
				padding: 0,
				textAlign: 'left',
				border: colors.selectedTheme.border,
				borderWidth: '1px',
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
				color: state.isSelected
					? colors.common.secondaryGold
					: colors.selectedTheme.button.text.primary,
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
				color: colors.selectedTheme.button.text.primary,
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
		}
		return styles
	}, [colors, fonts, variant])

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			{...props}
			components={{ IndicatorSeparator, ...props.components }}
		/>
	)
}

export default Select
