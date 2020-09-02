import { FC } from 'react';

import { formatPercent } from 'utils/formatters/number';
import styled from 'styled-components';

import ChangePositiveIcon from 'assets/svg/app/change-positive.svg';
import ChangeNegativeIcon from 'assets/svg/app/change-negative.svg';

type ChangePercentProps = {
	value: number;
	className?: string;
};

export const ChangePercent: FC<ChangePercentProps> = ({ value, ...rest }) => {
	const isPositive = value > 0;

	return (
		<CurrencyChange isPositive={isPositive} {...rest}>
			{isPositive ? <ChangePositiveIcon /> : <ChangeNegativeIcon />}
			{formatPercent(Math.abs(value))}
		</CurrencyChange>
	);
};

const CurrencyChange = styled.span<{ isPositive: boolean }>`
	display: inline-flex;
	align-items: center;
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
	font-family: ${(props) => props.theme.fonts.mono};
	svg {
		margin-right: 5px;
		width: 12px;
		height: 12px;
	}
`;

export default ChangePercent;
