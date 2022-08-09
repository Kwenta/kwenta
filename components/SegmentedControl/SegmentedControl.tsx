import React from 'react';
import styled, { css } from 'styled-components';

interface SegmentedControlProps {
	values: string[];
	selectedIndex: number;
	onChange(index: number): void;
	style?: React.CSSProperties;
	className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
	values,
	selectedIndex,
	onChange,
	...props
}) => (
	<SegmentedControlContainer $length={values.length} {...props}>
		{values.map((value, index) => (
			<SegmentedControlOption
				key={value}
				isSelected={selectedIndex === index}
				onClick={() => onChange(index)}
			>
				{value}
			</SegmentedControlOption>
		))}
	</SegmentedControlContainer>
);

const SegmentedControlContainer = styled.div<{ $length: number }>`
	display: grid;
	grid-template-columns: repeat(${(props) => props.$length}, 1fr);
	box-sizing: border-box;
	grid-gap: 14px;
	width: 100%;
	height: 38px;
	padding: 4px;
	background: ${(props) => props.theme.colors.selectedTheme.segmented.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
`;

const SegmentedControlOption = styled.button<{ isSelected: boolean }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	cursor: pointer;

	${(props) =>
		props.isSelected
			? css`
					background: ${(props) => props.theme.colors.selectedTheme.segmented.button.background};
					position: relative;
					border: ${(props) => props.theme.colors.selectedTheme.border};
					border-radius: 6px;
					color: ${(props) => props.theme.colors.selectedTheme.button.text};
					font-family: ${(props) => props.theme.fonts.bold};
					&::before {
						border-radius: 6px;
					}
			  `
			: css`
					background: transparent;
					border: none;
					color: ${(props) => props.theme.colors.selectedTheme.segmented.button.inactive.color};
			  `}
`;

export default SegmentedControl;
