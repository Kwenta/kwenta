import { FC } from 'react';
import { UseQueryResult } from 'react-query';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DeprecatedSynthsBalances } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import Button from 'components/Button';
import useRedeemDeprecatedSynths from 'hooks/useRedeemDeprecatedSynths';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';

const RedeemableDeprecatedSynths: FC<{
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>;
}> = ({ redeemableDeprecatedSynthsQuery }) => {
	const { t } = useTranslation();
	const {
		isRedeeming,
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

	return (
		<>
			<Container>
				{t('modals.notifications.deprecated-synths.description')}

				<Button
					variant="primary"
					isRounded={true}
					size="lg"
					disabled={isRedeeming}
					onClick={handleRedeem}
				>
					{t(`dashboard.deprecated.button.${isRedeeming ? 'redeeming' : 'default'}`)}
				</Button>
			</Container>

			{!redeemTxModalOpen ? null : (
				<RedeemTxModal
					{...{ txError, balances, totalUSDBalance }}
					onDismiss={handleDismiss}
					attemptRetry={handleRedeem}
				/>
			)}
		</>
	);
};

const Container = styled.div`
	display: flex;
	justify-content: space-between;
`;

export default RedeemableDeprecatedSynths;
