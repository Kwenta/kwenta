import Wei, { wei } from '@synthetixio/wei';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'state/store';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';
import { CurrencyKey } from 'constants/currency';
import { MessageButton } from 'sections/exchange/FooterCard/common';
import { FlexDivColCentered, numericValueCSS } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';

export type TxProvider = 'synthetix' | '1inch';

type RedeemTxModalProps = {
	onDismiss: () => void;
	txError: string | null;
	attemptRetry: () => void;
};

export const RedeemTxModal: FC<RedeemTxModalProps> = ({ onDismiss, txError, attemptRetry }) => {
	const { t } = useTranslation();

	const { totalRedeemableBalance, redeemableSynthBalances } = useAppSelector(({ exchange }) => ({
		totalRedeemableBalance: exchange.totalRedeemableBalance,
		redeemableSynthBalances: exchange.redeemableSynthBalances,
	}));

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen title={t('modals.confirm-transaction.title')}>
			<Title>{t('modals.deprecated-synths.from')}</Title>
			<Balances>
				{redeemableSynthBalances.map((balance) => (
					<BalanceItem
						key={balance.currencyKey}
						currencyKey={balance.currencyKey}
						amount={balance.usdBalance}
					/>
				))}
				<Title topPad>{t('modals.deprecated-synths.to')}</Title>
				<BalanceItem currencyKey={'sUSD'} amount={totalRedeemableBalance} />
			</Balances>
			<Subtitle>{t('modals.confirm-transaction.confirm-with-provider')}</Subtitle>
			{txError != null && (
				<Actions>
					<Message>{txError}</Message>
					<MessageButton onClick={attemptRetry} data-testid="retry-btn">
						{t('common.transaction.reattempt')}
					</MessageButton>
				</Actions>
			)}
		</StyledBaseModal>
	);
};

const BalanceItem: FC<{ currencyKey: CurrencyKey; amount: Wei | null }> = ({
	currencyKey,
	amount,
}) => (
	<StyledBalanceItem>
		<BalanceItemTitle>
			<Currency.Icon {...{ currencyKey }} width={'24px'} height={'24px'} />
			{currencyKey}
		</BalanceItemTitle>

		<BalanceItemAmount>
			{formatCryptoCurrency(amount ?? wei(0), { maxDecimals: 2 })} {'sUSD'}
		</BalanceItemAmount>
	</StyledBalanceItem>
);

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 300px;
	}
	.card-body {
		padding: 24px;
	}
`;

const Balances = styled.div`
	display: flex;
	flex-direction: column;
	padding-bottom: 24px;
`;

const StyledBalanceItem = styled.div`
	display: grid;
	align-items: center;
	grid-template-columns: 1fr 1fr;

	& > div:last-child {
		justify-self: right;
	}
`;

const BalanceItemTitle = styled.div`
	display: flex;
	grid-gap: 12px;
	align-items: center;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const BalanceItemAmount = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	${numericValueCSS};
`;

const Subtitle = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	padding-bottom: 48px;
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

export const TooltipItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
		transform: translateY(2px);
	}
`;

const Title = styled.div<{ topPad?: boolean }>`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 12px;
	margin-bottom: 12px;
	${(props) => (!props.topPad ? '' : 'margin-top: 24px;')}
`;

export default RedeemTxModal;
