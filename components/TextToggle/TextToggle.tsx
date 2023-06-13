import React from 'react';
import styled, { css } from 'styled-components';

import { FlexDiv, FlexDivCol } from 'components/layout/flex';
import { Body } from 'components/Text';

interface ToggleProps<T> {
	title: string;
	options: T[];
	selectedOption: T;
	onOptionChange: (value: T) => void;
}

const Toggle: React.FC<ToggleProps<any>> = ({ title, options, selectedOption, onOptionChange }) => {
	return (
		<FlexDivCol>
			<Body color="secondary">{title}</Body>
			<FlexDiv columnGap="10px">
				{options.map((value) => (
					<ToggleButton
						color="secondary"
						$active={selectedOption === value}
						onClick={() => onOptionChange(value)}
					>
						{value}
					</ToggleButton>
				))}
			</FlexDiv>
		</FlexDivCol>
	);
};

const ToggleButton = styled(Body)<{ $active: boolean }>`
	cursor: pointer;
	text-transform: capitalize;

	${(props) =>
		props.$active &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.text.primary};
			font-weight: 700;
		`}
`;

export default Toggle;
