import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';

import BaseModal from 'components/BaseModal';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import InfoBox from 'components/InfoBox';
import Button from 'components/Button';
import { FlexDivRowCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { parseGasPriceObject } from 'hooks/useGas';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { getFuturesMarketContract } from 'queries/futures/utils';

type DepositMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const DepositMarginModal: React.FC<DepositMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	sUSDBalance,
	accessibleMargin,
	market,
}) => {
	const { synthetixjs } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('');
	const [error, setError] = React.useState<string | null>(null);
	const [gasLimit, setGasLimit] = React.useState<number | null>(null);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = React.useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrices = React.useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed]
		? parseGasPriceObject(ethGasPriceQuery?.data?.[gasSpeed])
		: null;

	const transactionFee = React.useMemo(
		() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate),
		[gasPrice, gasLimit, ethPriceRate]
	);

	React.useEffect(() => {
		const getGasLimit = async () => {
			if (!market || !synthetixjs) return;
			try {
				setError(null);
				setGasLimit(null);
				if (!amount || Number(amount) === 0) return;
				const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
				const marginAmount = wei(amount).toBN();
				const estimate = await FuturesMarketContract.estimateGas.transferMargin(
					wei(marginAmount).toBN()
				);
				setGasLimit(Number(estimate));
			} catch (e) {
				// @ts-expect-error
				console.log(e.message);
				// @ts-expect-error
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs]);

	return (
		<StyledBaseModal title="Deposit Margin" isOpen={true} onDismiss={onDismiss}>
			<BalanceContainer>
				<BalanceText>Balance:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<StyledInfoBox
				details={{
					Fee: transactionFee
						? formatCurrency(Synths.sUSD, transactionFee, { sign: '$' })
						: NO_VALUE,
					'Gas Fee': '',
					Total: '',
				}}
			/>
			<DepositMarginButton fullWidth>Deposit Margin</DepositMarginButton>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}

	.card-body {
		padding: 28px;
	}
`;

const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
`;

const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	span {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

const StyledInfoBox = styled(InfoBox)`
	margin-top: 15px;
	margin-bottom: 15px;
`;

const DepositMarginButton = styled(Button)`
	height: 55px;
`;

export default DepositMarginModal;
