import React from 'react';
import styled, { css } from 'styled-components';

type StyleType = 'tab' | 'check';

interface SegmentedControlProps {
	values: string[];
	selectedIndex: number;
	style?: React.CSSProperties;
	className?: string;
	styleType?: StyleType;
	onChange(index: number): void;
}

function SegmentedControl({
	values,
	selectedIndex,
	onChange,
	styleType = 'tab',
	...props
}: SegmentedControlProps) {
	return (
		<SegmentedControlContainer $length={values.length} styleType={styleType} {...props}>
			{values.map((value, index) => (
				<SegmentedControlOption
					styleType={styleType}
					key={value}
					isSelected={selectedIndex === index}
					onClick={() => onChange(index)}
				>
					{styleType === 'check' && <CheckBox selected={selectedIndex === index} />}
					{value}
				</SegmentedControlOption>
			))}
		</SegmentedControlContainer>
	);
}

const SegmentedControlContainer = styled.div<{ $length: number; styleType: StyleType }>`
	display: grid;
	grid-template-columns: repeat(${(props) => props.$length}, 1fr);
	box-sizing: border-box;
	grid-gap: 14px;
	width: 100%;
	height: ${(props) => (props.styleType === 'tab' ? '38px' : '24px')};
	padding: ${(props) => (props.styleType === 'tab' ? '4px' : '0')};
	background: ${(props) =>
		props.styleType === 'tab' ? props.theme.colors.selectedTheme.segmented.background : 'none'};
	border: ${(props) =>
		props.styleType === 'tab' ? props.theme.colors.selectedTheme.border : 'none'};
	border-radius: 8px;
`;

const SegmentedControlOption = styled.button<{ isSelected: boolean; styleType: StyleType }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	cursor: pointer;
	text-transform: capitalize;
	text-align: ${(props) => (props.styleType === 'check' ? 'left' : 'center')};
	display: ${(props) => (props.styleType === 'check' ? 'flex' : 'inherit')};
	align-items: center;
	color: ${(props) =>
		props.isSelected
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.segmented.button.inactive.color};

	${(props) =>
		props.isSelected && props.styleType === 'tab'
			? css`
					background: ${(props) => props.theme.colors.selectedTheme.segmented.button.background};
					position: relative;
					border: ${(props) => props.theme.colors.selectedTheme.border};
					border-radius: 6px;
					font-family: ${(props) => props.theme.fonts.bold};
					&::before {
						border-radius: 6px;
					}
			  `
			: css`
					background: transparent;
					border: none;
			  `}
`;

const CheckBox = styled.div<{ selected: boolean }>`
	margin-right: 10px;
	outline: ${(props) => props.theme.colors.selectedTheme.outlineBorder};
	border-radius: 2px;
	outline-width: 3px;
	height: 15px;
	width: 15px;
	background: ${(props) =>
		props.selected ? props.theme.colors.selectedTheme.yellow : 'transparent'};
`;

export default SegmentedControl;
