import { useMemo } from 'react';
import { NO_VALUE } from 'constants/placeholder';
import styled from 'styled-components';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { formatCurrency } from 'utils/formatters/number';
import Wei from '@synthetixio/wei';

type ProfitLossType = {
	value?: Wei | null;
};

const ProfitLoss = ({ value }: ProfitLossType) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const isPositive = useMemo(() => (value != null ? (value.eq(0) ? null : value.gt(0)) : null), [
		value,
	]);

	return (
		<>
			{value != null ? (
				<Container isPositive={isPositive}>
					{isPositive != null && (isPositive ? '+' : '-')}
					{formatCurrency(selectedPriceCurrency.name, value.abs(), {
						sign: selectedPriceCurrency.sign,
					})}
				</Container>
			) : (
				<span>{NO_VALUE}</span>
			)}
		</>
	);
};

export const Container = styled.span<{ isPositive?: boolean | null }>`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) =>
		props.isPositive != null
			? props.isPositive
				? props.theme.colors.green
				: props.theme.colors.red
			: props.theme.colors.white};
`;

export default ProfitLoss;
