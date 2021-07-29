import { FC } from 'react';
import styled from 'styled-components';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';

import SynthBalanceRow, { SynthBalanceRowProps } from './SynthBalanceRow';
import { SynthBalance } from '@synthetixio/queries';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';

type SynthBalancesProps = Omit<SynthBalanceRowProps, 'synth'> & {
	balances: SynthBalance[];
};

const SynthBalances: FC<SynthBalancesProps> = ({ exchangeRates, balances, totalUSDBalance }) => {
	if (balances.length === 0) {
		return <NoSynthsCard />;
	}

	return (
		<>
			{balances.map((synth: SynthBalance) => (
				<SynthBalanceRow
					key={synth.currencyKey}
					synth={synth}
					totalUSDBalance={totalUSDBalance}
					exchangeRates={exchangeRates}
				/>
			))}
		</>
	);
};

export const NoBalancesContainer = styled(GridDivCentered)`
	width: 100%;
	border-radius: 4px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	margin: 0 auto;
	${media.lessThan('md')`
		justify-items: center;
		grid-template-columns: unset;
		grid-gap: 30px;
	`}
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export default SynthBalances;
