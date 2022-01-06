import React from 'react';
import styled, { css } from 'styled-components';

type SegmentedControlProps = {
	values: string[];
	selectedIndex: number;
	onChange(index: number): void;
};

const SegmentedControl: React.FC<SegmentedControlProps> = ({ values, selectedIndex, onChange }) => (
	<SegmentedControlContainer length={values.length}>
		{values.map((value, index) => (
			<SegmentedControlOption isSelected={selectedIndex === index} onClick={() => onChange(index)}>
				{value}
			</SegmentedControlOption>
		))}
	</SegmentedControlContainer>
);

const SegmentedControlContainer = styled.div<{ length: number }>`
	display: grid;
	grid-template-columns: repeat(${(props) => props.length}, 1fr);
	grid-gap: 14px;
	height: 46px;
	padding: 6px;
	background: linear-gradient(180deg, #1b1b1b 0%, #212121 100%);
	border: 1px solid #ffffff1a;
	border-radius: 6px;
`;

const SegmentedControlOption = styled.button<{ isSelected: boolean }>`
	font-size: 13px;
	font-weight: bold;
	cursor: pointer;
	${({ isSelected }) =>
		isSelected
			? css`
					background: linear-gradient(
						180deg,
						rgba(228, 179, 120, 0.12) 11.46%,
						rgba(135, 105, 70, 0.06) 100%
					);
					box-shadow: 0px 1px 0px 0px #ffffff12 inset;
					box-shadow: 0px 1px 2px 0px #00000080;
					box-shadow: 0px 4px 4px 0px #00000040;
					box-shadow: 0px 0px 20px 0px #ffffff08 inset;
					border: 1px solid #ffffff1a;
					color: #ece8e3;
					font-weight: 700;
					border-radius: 6px;
			  `
			: css`
					background: transparent;
					border: none;
					color: #787878;
			  `}
`;

export default SegmentedControl;
