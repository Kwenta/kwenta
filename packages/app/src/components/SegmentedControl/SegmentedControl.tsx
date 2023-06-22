import React, { FC, memo } from 'react'
import styled, { css } from 'styled-components'

export type StyleType = 'tab' | 'check' | 'pill-button' | 'pill-button-large'

interface SegmentedControlProps {
	values: React.ReactNode[]
	selectedIndex?: number
	style?: React.CSSProperties
	className?: string
	styleType?: StyleType
	suffix?: string
	isLarge?: boolean | undefined
	onChange(index: number): void
	icon?: boolean
}

const SegmentedControl: FC<SegmentedControlProps> = memo(
	({ values, selectedIndex, suffix, onChange, styleType = 'tab', icon, ...props }) => {
		return (
			<SegmentedControlContainer $length={values.length} styleType={styleType} {...props}>
				{values.map((value, index) => (
					<SegmentedControlOption
						styleType={styleType}
						key={index}
						isSelected={selectedIndex === index}
						onClick={() => onChange(index)}
						$icon={icon}
					>
						{styleType === 'check' && <CheckBox selected={selectedIndex === index} />}
						{value}
						{suffix}
					</SegmentedControlOption>
				))}
			</SegmentedControlContainer>
		)
	}
)

const SegmentedControlContainer = styled.div<{ $length: number; styleType: StyleType }>`
	${(props) =>
		props.$length > 2 && props.styleType === 'check'
			? 'display: flex; justify-content: space-between;'
			: 'display: grid;'}
	grid-template-columns: repeat(${(props) => props.$length}, 1fr);
	grid-gap: ${(props) =>
		props.styleType === 'tab' || props.styleType === 'pill-button-large' ? '14px' : '6px'};
	box-sizing: border-box;
	width: 100%;
	height: ${(props) =>
		props.styleType === 'tab' || props.styleType === 'pill-button-large' ? '38px' : '22px'};
	padding: ${(props) => (props.styleType === 'tab' ? '4px' : '0')};
	background: ${(props) =>
		props.styleType === 'tab'
			? props.theme.colors.selectedTheme.segmentedControl.background
			: 'none'};
	border: ${(props) =>
		props.styleType === 'tab' ? props.theme.colors.selectedTheme.border : 'none'};
	border-radius: 8px;
`

const SegmentedControlOption = styled.button<{
	isSelected: boolean
	styleType: StyleType
	$icon?: boolean
}>`
	font-size: ${(props) =>
		props.styleType === 'pill-button' || props.styleType === 'pill-button-large' ? '12px' : '13px'};
	font-family: ${(props) =>
		props.styleType === 'tab' && props.isSelected
			? props.theme.fonts.bold
			: props.styleType === 'pill-button-large'
			? props.theme.fonts.mono
			: props.theme.fonts.regular};
	cursor: pointer;
	text-transform: capitalize;
	text-align: ${(props) => (props.styleType === 'check' ? 'left' : 'center')};
	display: ${(props) => (props.styleType === 'check' ? 'flex' : 'inherit')};
	align-items: center;
	border: ${(props) => {
		if (
			(props.isSelected && props.styleType === 'tab') ||
			props.styleType === 'pill-button' ||
			props.styleType === 'pill-button-large'
		)
			return props.theme.colors.selectedTheme.border
		return 'none'
	}};
	border-radius: ${(props) =>
		props.styleType === 'pill-button'
			? '20px'
			: props.styleType === 'pill-button-large'
			? '10px'
			: '6px'};
	border-color: ${(props) =>
		(props.styleType === 'pill-button' || props.styleType === 'pill-button-large') &&
		props.isSelected
			? props.theme.colors.selectedTheme.yellow
			: undefined};
	color: ${(props) =>
		props.isSelected &&
		(props.styleType === 'pill-button' || props.styleType === 'pill-button-large')
			? props.theme.colors.common.primaryYellow
			: props.isSelected
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.segmentedControl.button.inactive.color};

	background: ${(props) =>
		props.isSelected && (props.styleType === 'tab' || props.styleType === 'pill-button-large')
			? props.theme.colors.selectedTheme.segmentedControl.button.background
			: 'transparent'};

	background-color: ${(props) =>
		props.isSelected &&
		(props.styleType === 'pill-button' || props.styleType === 'pill-button-large') &&
		props.theme.colors.common.darkYellow};

	${(props) =>
		props.$icon &&
		css`
			display: flex;
			justify-content: center;
			align-items: center;

			svg {
				fill: ${props.theme.colors.selectedTheme.newTheme.button.tab[
					props.isSelected ? 'active' : 'inactive'
				]};
			}
		`}
	transition: all 0.1s ease-in-out;
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.icon.hover};
		> div {
			background-color: ${(props) => !props.isSelected && props.theme.colors.common.darkYellow};
		}
	}
`

const CheckBox = styled.div<{ selected: boolean }>`
	transition: all 0.1s ease-in-out;
	margin-right: 10px;
	outline: ${(props) => props.theme.colors.selectedTheme.outlineBorder};
	border-radius: 2px;
	outline-width: 3px;
	height: 15px;
	width: 15px;
	background: ${(props) =>
		props.selected ? props.theme.colors.selectedTheme.yellow : 'transparent'};
`

export default SegmentedControl
