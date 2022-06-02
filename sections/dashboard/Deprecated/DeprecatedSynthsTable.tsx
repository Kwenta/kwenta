import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';
import { DeprecatedSynthsBalances, DeprecatedSynthBalance } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import useRedeemDeprecatedSynths from 'hooks/useRedeemDeprecatedSynths';

import SynthBalanceRow from './DeprecatedSynthsTableRow';
import DeprecatedSynthsFooter from './DeprecatedSynthsFooter';
import RedeemTxModal from './RedeemTxModal';
import ROUTES from 'constants/routes';

type DeprecatedSynthsTableProps = {
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>;
};

const DeprecatedSynthsTable: FC<DeprecatedSynthsTableProps> = ({
	redeemableDeprecatedSynthsQuery,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const onSuccess = () => router.push(ROUTES.Dashboard.Home);
	const {
		isRedeeming,
		redeemTxModalOpen,
		txError,
		handleRedeem,
		handleDismiss,
		transactionFee,
	} = useRedeemDeprecatedSynths(redeemableDeprecatedSynthsQuery, onSuccess);

	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;
	const balances = redeemableDeprecatedSynths?.balances ?? [];
	const totalUSDBalance = wei(redeemableDeprecatedSynths?.totalUSDBalance ?? 0);

	if (balances.length === 0 && totalUSDBalance.eq(0)) {
		return <NoSynthsCard />;
	}

	return (
		<Container>
			<Title>{t('dashboard.deprecated.info')}</Title>

			{balances.map((synth: DeprecatedSynthBalance) => (
				<SynthBalanceRow key={synth.currencyKey} {...{ synth, totalUSDBalance }} />
			))}

			<DeprecatedSynthsFooter
				{...{ totalUSDBalance, transactionFee, isRedeeming }}
				onSubmit={handleRedeem}
			/>
			{!redeemTxModalOpen ? null : (
				<RedeemTxModal
					{...{ txError, balances, totalUSDBalance }}
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export default DeprecatedSynthsTable;
