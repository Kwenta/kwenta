import { FC } from 'react';
import { Svg } from 'react-optimized-image';
import styled from 'styled-components';

import media from 'styles/media';
import { formatPercent } from 'utils/formatters/number';
import ChangePositiveIcon from 'assets/svg/app/change-positive.svg';
import ChangeNegativeIcon from 'assets/svg/app/change-negative.svg';

type ChangePercentProps = {
	value: number;
	className?: string;
	decimals?: number;
};

export const ChangePercent: FC<ChangePercentProps> = ({ value, decimals=2, ...rest }) => {
	const isPositive = value >= 0;

	return (
		<CurrencyChange isPositive={isPositive} {...rest}>
			{isPositive ? (
				<Svg
					src={ChangePositiveIcon}
					viewBox={`0 0 ${ChangePositiveIcon.width} ${ChangePositiveIcon.height}`}
				/>
			) : (
				<Svg
					src={ChangeNegativeIcon}
					viewBox={`0 0 ${ChangeNegativeIcon.width} ${ChangeNegativeIcon.height}`}
				/>
			)}
			{formatPercent(Math.abs(value), { minDecimals: decimals })}
		</CurrencyChange>
	);
};

const CurrencyChange = styled.span<{ isPositive: boolean }>`
	display: inline-flex;
	align-items: center;
	color: ${(props) => (props.isPositive ? props.theme.colors.common.primaryGreen : props.theme.colors.common.primaryRed)};
	font-family: ${(props) => props.theme.fonts.mono};
	svg {
		margin-right: 5px;
		width: 12px;
		height: 12px;
	}

	${media.lessThan('md')`
		margin-right: 5px;
	`}
`;

export default ChangePercent;
