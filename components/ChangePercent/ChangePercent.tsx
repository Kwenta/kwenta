import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo } from 'react';
import styled from 'styled-components';

import ChangeNegativeIcon from 'assets/svg/app/change-negative.svg';
import ChangePositiveIcon from 'assets/svg/app/change-positive.svg';
import { NO_VALUE } from 'constants/placeholder';
import { formatPercent } from 'utils/formatters/number';

type ChangePercentProps = {
	value: WeiSource;
	className?: string;
	decimals?: number;
	showArrow?: boolean;
};

export const ChangePercent: FC<ChangePercentProps> = memo(
	({ value, decimals = 2, showArrow = true, ...rest }) => {
		const isValid = !!value;
		const isZero = value && wei(value).eq(0);
		const isPositive = value && wei(value).gt(0);
		return (
			<CurrencyChange isValid={isValid} isPositive={isPositive} isZero={isZero} {...rest}>
				{!isValid || isZero ? (
					<>{NO_VALUE}</>
				) : !showArrow ? (
					<></>
				) : !isZero && isPositive ? (
					<ChangePositiveIcon />
				) : (
					<ChangeNegativeIcon />
				)}
				{!isZero && value && formatPercent(wei(value).abs(), { minDecimals: decimals })}
			</CurrencyChange>
		);
	}
);

const CurrencyChange = styled.span<{ isValid: boolean; isPositive: boolean; isZero: boolean }>`
	display: inline-flex;
	align-items: center;
	color: ${(props) =>
		!props.isValid || props.isZero
			? props.theme.colors.selectedTheme.white
			: props.isPositive
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
	font-family: ${(props) => props.theme.fonts.mono};

	svg {
		margin-right: 5px;
		width: 10px;
		height: 10px;
		path {
			fill: ${(props) =>
				props.isPositive
					? props.theme.colors.selectedTheme.green
					: props.theme.colors.selectedTheme.red};
		}
	}
`;

export default ChangePercent;
