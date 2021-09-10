import { FC } from 'react';
import { UseQueryResult } from 'react-query';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import useRedeemDeprecatedSynths from 'hooks/useRedeemDeprecatedSynths';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';
import { Balances } from '@synthetixio/queries';

const RedeemableDeprecatedSynths: FC<{
	redeemableDeprecatedSynthsQuery: UseQueryResult<Balances>;
}> = ({ redeemableDeprecatedSynthsQuery }) => {
	const { t } = useTranslation();
	const {
		isRedeeming,
		transactionFee,
		redeemTxModalOpen,
		txError,
		handleRedeem,
		handleDismiss,
	} = useRedeemDeprecatedSynths(redeemableDeprecatedSynthsQuery);

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
					{...{ txError, transactionFee }}
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
