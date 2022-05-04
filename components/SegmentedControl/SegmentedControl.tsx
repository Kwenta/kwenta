import React from 'react';
import styled, { css } from 'styled-components';
import { border } from 'components/Button';
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
	height: 46px;
	padding: 6px;
	background: ${(props) => props.theme.colors.selectedTheme.segmented.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
`;

const SegmentedControlOption = styled.button<{ isSelected: boolean }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.bold};
	cursor: pointer;

	${(props) =>
		props.isSelected
			? css`
				
					background: ${(props) => props.theme.colors.selectedTheme.segmented.button.background};
					position:relative;
					box-shadow: ${(props) => props.theme.colors.selectedTheme.segmented.button.shadow};
					border: none;
					border-radius: 6px;
					${border}
					color: ${(props) => props.theme.colors.common.primaryWhite};
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
