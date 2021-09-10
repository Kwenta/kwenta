import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';
import { Balances, Rates, SynthBalance } from '@synthetixio/queries';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';

import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import useRedeemDeprecatedSynths from 'hooks/useRedeemDeprecatedSynths';

import SynthBalanceRow from './DeprecatedSynthsTableRow';
import DeprecatedSynthsFooter from './DeprecatedSynthsFooter';
import RedeemTxModal from './RedeemTxModal';
import { wei } from '@synthetixio/wei';

type DeprecatedSynthsTableProps = {
	exchangeRates: Rates | null;
	redeemableDeprecatedSynthsQuery: UseQueryResult<Balances>;
};

const DeprecatedSynthsTable: FC<DeprecatedSynthsTableProps> = ({
	exchangeRates,
	redeemableDeprecatedSynthsQuery,
}) => {
	const { t } = useTranslation();
	const {
		isRedeeming,
		transactionFee,
		redeemTxModalOpen,
		txError,
		handleRedeem,
		handleDismiss,
	} = useRedeemDeprecatedSynths(redeemableDeprecatedSynthsQuery);

	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;
	const balances = redeemableDeprecatedSynths?.balances ?? [];
	const totalUSDBalance = wei(redeemableDeprecatedSynths?.totalUSDBalance ?? 0);

	if (balances.length === 0) {
		return <NoSynthsCard />;
	}

	return (
		<Container>
			<Title>{t('dashboard.deprecated.info')}</Title>

			{balances.map((synth: SynthBalance) => (
				<SynthBalanceRow key={synth.currencyKey} {...{ synth, totalUSDBalance, exchangeRates }} />
			))}

			<DeprecatedSynthsFooter
				{...{ totalUSDBalance, transactionFee, isRedeeming }}
				onSubmit={handleRedeem}
			/>
			{!redeemTxModalOpen ? null : (
				<RedeemTxModal
					{...{ txError, transactionFee }}
					onDismiss={handleDismiss}
					attemptRetry={handleRedeem}
				/>
			)}
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
