import { DeprecatedSynthsBalances } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';
import styled from 'styled-components';

import Button from 'components/Button';
import { Synths } from 'constants/currency';
import useRedeemDeprecatedSynths from 'hooks/useRedeemDeprecatedSynths';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';
import { formatCurrency } from 'utils/formatters/number';

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
				{t('modals.notifications.deprecated-synths.short-description', {
					amount: formatCurrency(Synths.sUSD, totalUSDBalance, { maxDecimals: 2 }),
					asset: Synths.sUSD,
				})}

				<Button
					variant="primary"
					isRounded={true}
					size="sm"
					disabled={isRedeeming}
					onClick={handleRedeem}
				>
					{t(
						`modals.notifications.deprecated-synths.button.${isRedeeming ? 'redeeming' : 'default'}`
					)}
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
	align-items: center;
	padding: 12px 14px;
`;

export default RedeemableDeprecatedSynths;
