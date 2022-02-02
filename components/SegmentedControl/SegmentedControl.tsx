import React from 'react';
import styled, { css } from 'styled-components';

interface SegmentedControlProps {
	values: string[];
	selectedIndex: number;
	onChange(index: number): void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ values, selectedIndex, onChange }) => (
	<SegmentedControlContainer length={values.length}>
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

const SegmentedControlContainer = styled.div<{ length: number }>`
	display: grid;
	grid-template-columns: repeat(${(props) => props.length}, 1fr);
	box-sizing: border-box;
	grid-gap: 14px;
	width: 100%;
	height: 46px;
	padding: 6px;
	background: ${(props) => props.theme.colors.current.segmented.background};
	border: ${(props) => props.theme.colors.current.border};
	border-radius: 16px;
`;

const SegmentedControlOption = styled.button<{ isSelected: boolean }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.bold};
	cursor: pointer;

	${(props) =>
		props.isSelected
			? css`
					background: ${(props) => props.theme.colors.current.segmented.button.background};
					box-shadow: ${(props) => props.theme.colors.current.segmented.button.shadow};
					border: ${(props) => props.theme.colors.current.border};
					color: ${(props) => props.theme.colors.common.primaryWhite};
					font-weight: 700;
					border-radius: 12px;
			  `
			: css`
					background: transparent;
					border: none;
					color: ${(props) => props.theme.colors.current.segmented.button.inactive};
			  `}
`;

export default SegmentedControl;
