import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import Error from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { currentMarketState, positionState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { formatDollars } from 'utils/formatters/number';

import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	GasFeeContainer,
	MaxButton,
	MarginActionButton,
} from './DepositMarginModal';

type WithdrawMarginModalProps = {
	onDismiss(): void;
};

const PLACEHOLDER = '$0.00';
const ZERO_WEI = wei(0);

const WithdrawMarginModal: React.FC<WithdrawMarginModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const [amount, setAmount] = React.useState('');
	const [isDisabled, setDisabled] = React.useState(true);
	const [isMax, setMax] = React.useState(false);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { estimateSnxTxGasCost } = useEstimateGasCost();

	const { handleRefetch } = useRefetchContext();

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const position = useRecoilValue(positionState);
	const accessibleMargin = position?.accessibleMargin ?? ZERO_WEI;

	const computedAmount = React.useMemo(
		() =>
			accessibleMargin.eq(wei(amount || 0))
				? accessibleMargin.mul(wei(-1)).toBN()
				: wei(-amount).toBN(),
		[amount, accessibleMargin]
	);

	const withdrawTxn = useSynthetixTxn(
		`FuturesMarket${market?.[0] === 's' ? market?.substring(1) : market}`,
		isMax ? 'withdrawAllMargin' : 'transferMargin',
		isMax ? [] : [computedAmount],
		gasPrice || undefined,
		{ enabled: !!market && !!amount }
	);

	const transactionFee = estimateSnxTxGasCost(withdrawTxn);

	React.useEffect(() => {
		if (withdrawTxn.hash) {
			monitorTransaction({
				txHash: withdrawTxn.hash,
				onTxConfirmed: () => {
					handleRefetch('margin-change');
					onDismiss();
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [withdrawTxn.hash]);

	React.useEffect(() => {
		if (!amount) {
			setDisabled(true);
			return;
		}

		const amtWei = wei(amount);

		if (amtWei.gt(ZERO_WEI) && amtWei.lte(accessibleMargin)) {
			setDisabled(false);
		} else {
			setDisabled(true);
		}
	}, [amount, isDisabled, accessibleMargin, setDisabled]);

	const handleSetMax = React.useCallback(() => {
		setMax(true);
		setAmount(accessibleMargin.toString());
	}, [accessibleMargin]);

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.withdraw.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(accessibleMargin)}</span> sUSD
				</BalanceText>
			</BalanceContainer>

			<CustomInput
				dataTestId="futures-market-trade-withdraw-margin-input"
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => {
					if (isMax) setMax(false);
					setAmount(v);
				}}
				right={
					<MaxButton data-testid="futures-market-trade-withdraw-max-button" onClick={handleSetMax}>
						{t('futures.market.trade.margin.modal.max')}
					</MaxButton>
				}
			/>
			<Spacer height={20} />

			<MarginActionButton
				data-testid="futures-market-trade-withdraw-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={() => withdrawTxn.mutate()}
			>
				{t('futures.market.trade.margin.modal.withdraw.button')}
			</MarginActionButton>

			<GasFeeContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.gas-fee')}:</BalanceText>
				<BalanceText>
					<span>
						{transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE}
					</span>
				</BalanceText>
			</GasFeeContainer>

			{withdrawTxn.errorMessage && (
				<Error message={withdrawTxn.errorMessage} formatter="revert"></Error>
			)}
		</StyledBaseModal>
	);
};

export default WithdrawMarginModal;
