import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';

import SynthBalanceRow, { DeprecatedSynthsTableRowProps } from './DeprecatedSynthsTableRow';
import { SynthBalance } from '@synthetixio/queries';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';

type DeprecatedSynthsTableProps = Omit<DeprecatedSynthsTableRowProps, 'synth'> & {
	balances: SynthBalance[];
};

const DeprecatedSynthsTable: FC<DeprecatedSynthsTableProps> = ({
	exchangeRates,
	balances,
	totalUSDBalance,
}) => {
	const { t } = useTranslation();

	if (balances.length === 0) {
		return <NoSynthsCard />;
	}

	return (
		<Container>
			<Title>{t('dashboard.deprecated.info')}</Title>

			{balances.map((synth: SynthBalance) => (
				<SynthBalanceRow
					key={synth.currencyKey}
					synth={synth}
					totalUSDBalance={totalUSDBalance}
					exchangeRates={exchangeRates}
				/>
			))}
		</Container>
	);
};

const Container = styled.div``;

const Title = styled.div`
	margin: 12px 0;
`;

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

export default DeprecatedSynthsTable;
