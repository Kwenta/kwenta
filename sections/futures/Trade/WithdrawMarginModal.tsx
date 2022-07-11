import React from 'react';
import Wei, { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';

import TransactionNotifier from 'containers/TransactionNotifier';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { newGetTransactionPrice } from 'utils/network';
import { formatCurrency } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import CustomInput from 'components/Input/CustomInput';
import Error from 'components/Error';
import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	GasFeeContainer,
	MaxButton,
	MarginActionButton,
} from './DepositMarginModal';
import { currentMarketState, positionState } from 'store/futures';
import { useRefetchContext } from 'contexts/RefetchContext';

type WithdrawMarginModalProps = {
	onDismiss(): void;
	sUSDBalance: Wei;
};

const PLACEHOLDER = '$0.00';
const ZERO_WEI = wei(0);

const WithdrawMarginModal: React.FC<WithdrawMarginModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { useEthGasPriceQuery, useExchangeRatesQuery, useSynthetixTxn } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('');
	const [isDisabled, setDisabled] = React.useState<boolean>(true);
	const [isMax, setMax] = React.useState(false);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const { handleRefetch } = useRefetchContext();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = React.useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

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

	const transactionFee = React.useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				withdrawTxn.gasLimit,
				ethPriceRate,
				withdrawTxn.optimismLayerOneFee
			),
		[gasPrice, ethPriceRate, withdrawTxn.gasLimit, withdrawTxn.optimismLayerOneFee]
	);

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
			isOpen={true}
			onDismiss={onDismiss}
		>
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, accessibleMargin, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>

			<CustomInput
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => {
					if (isMax) setMax(false);
					setAmount(v);
				}}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>

			<MarginActionButton disabled={isDisabled} fullWidth onClick={() => withdrawTxn.mutate()}>
				{t('futures.market.trade.margin.modal.withdraw.button')}
			</MarginActionButton>

			<GasFeeContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.gas-fee')}:</BalanceText>
				<BalanceText>
					<span>
						{transactionFee
							? formatCurrency(Synths.sUSD, transactionFee, { sign: '$', maxDecimals: 1 })
							: NO_VALUE}
					</span>
				</BalanceText>
			</GasFeeContainer>

			{withdrawTxn.errorMessage && <Error>{withdrawTxn.errorMessage}</Error>}
		</StyledBaseModal>
	);
};

export default WithdrawMarginModal;
