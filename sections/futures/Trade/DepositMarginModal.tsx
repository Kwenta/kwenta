import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import Button from 'components/Button';
import { FlexDivRowCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetTransactionPrice } from 'utils/network';
import { NO_VALUE } from 'constants/placeholder';
import CustomInput from 'components/Input/CustomInput';
import TransactionNotifier from 'containers/TransactionNotifier';

type DepositMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const PLACEHOLDER = '$0.00';
const MIN_DEPOSIT_AMOUNT = wei('50');

const DepositMarginModal: React.FC<DepositMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	sUSDBalance,
	market,
}) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery, useSynthetixTxn } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('');
	const [isDisabled, setDisabled] = React.useState<boolean>(true);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = React.useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const depositTxn = useSynthetixTxn(
		`FuturesMarket${market?.[0] === 's' ? market?.substring(1) : market}`,
		'transferMargin',
		[wei(amount || 0).toBN()],
		gasPrice || undefined,
		{ enabled: !!market && !!amount && !isDisabled }
	);

	const transactionFee = React.useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				depositTxn.gasLimit,
				ethPriceRate,
				depositTxn.optimismLayerOneFee
			),
		[gasPrice, ethPriceRate, depositTxn.gasLimit, depositTxn.optimismLayerOneFee]
	);

	React.useEffect(() => {
		if (!amount) {
			setDisabled(true);
			return;
		}

		const amtWei = wei(amount);

		if (amtWei.gte(MIN_DEPOSIT_AMOUNT) && amtWei.lte(sUSDBalance)) {
			setDisabled(false);
		} else {
			setDisabled(true);
		}
	}, [amount, isDisabled, sUSDBalance, setDisabled]);

	React.useEffect(() => {
		if (depositTxn.hash) {
			monitorTransaction({
				txHash: depositTxn.hash,
				onTxConfirmed: () => {
					onTxConfirmed();
					onDismiss();
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [depositTxn.hash]);

	const handleSetMax = React.useCallback(() => {
		setAmount(sUSDBalance.toString());
	}, [sUSDBalance]);

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.deposit.title')}
			isOpen={true}
			onDismiss={onDismiss}
		>
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<CustomInput
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>

			<MinimumAmountDisclaimer>
				{t('futures.market.trade.margin.modal.deposit.disclaimer')}
			</MinimumAmountDisclaimer>

			<MarginActionButton disabled={isDisabled} fullWidth onClick={() => depositTxn.mutate()}>
				{t('futures.market.trade.margin.modal.deposit.button')}
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

			{depositTxn.errorMessage && <ErrorMessage>{depositTxn.errorMessage}</ErrorMessage>}
		</StyledBaseModal>
	);
};

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 28px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding: 0 14px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.common.primaryGold : props.theme.colors.common.secondaryGray};
	span {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

export const MarginActionButton = styled(Button)`
	margin-top: 16px;
	height: 55px;
`;

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.common.primaryWhite};
	cursor: pointer;
`;

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin-top: 8px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-align: center;
`;

export const ErrorMessage = styled.div`
	margin-top: 16px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export const GasFeeContainer = styled(FlexDivRowCentered)`
	margin-top: 13px;
	padding: 0 14px;
	p {
		margin: 0;
	}
`;

export default DepositMarginModal;
