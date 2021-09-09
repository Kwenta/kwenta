import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SynthBalance } from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { ethers } from 'ethers';

import { Synths } from 'constants/currency';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';
import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	walletAddressState,
} from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import { normalizeGasLimit, gasPriceInWei, getTransactionPrice } from 'utils/network';
import { hexToAsciiV2 } from 'utils/formatters/string';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import SynthBalanceRow, { DeprecatedSynthsTableRowProps } from './DeprecatedSynthsTableRow';
import DeprecatedSynthsFooter from './DeprecatedSynthsFooter';
import RedeemTxModal from './RedeemTxModal';

type DeprecatedSynthsTableProps = Omit<DeprecatedSynthsTableRowProps, 'synth'> & {
	balances: SynthBalance[];
};

const DeprecatedSynthsTable: FC<DeprecatedSynthsTableProps> = ({
	exchangeRates,
	balances,
	totalUSDBalance,
}) => {
	const { t } = useTranslation();
	const {
		useEthGasPriceQuery,
		useSynthsBalancesQuery,
		useExchangeRatesQuery,
		useFeeReclaimPeriodQuery,
	} = useSynthetixQueries();
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const customGasPrice = useRecoilValue(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);

	const [redeemTxModalOpen, setRedeemTxModalOpen] = useState<boolean>(false);
	const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [txError, setTxError] = useState<string | null>(null);

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

	const Redeemer: ethers.Contract | null = useMemo(() => synthetixjs?.contracts.Redeemer ?? null, [
		synthetixjs,
	]);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const getMethodAndParams = useCallback(
		() => ({ method: 'redeemAll', params: [balances.map((b) => b.currencyKey)] }),
		[balances]
	);

	const getGasLimitEstimate = useCallback(async (): Promise<number | null> => {
		if (!Redeemer) return null;
		try {
			const { method, params } = getMethodAndParams();
			const gasEstimate = await Redeemer.estimateGas[method](...params);
			return normalizeGasLimit(Number(gasEstimate));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams, Redeemer]);

	useEffect(() => {
		async function updateGasLimit() {
			if (gasLimit == null) {
				const newGasLimit = await getGasLimitEstimate();
				setGasLimit(newGasLimit);
			}
		}
		updateGasLimit();
	}, [gasLimit, getGasLimitEstimate]);

	const handleRedeem = async () => {
		// if (!(Redeemer && gasPrice)) return;

		setTxError(null);
		setRedeemTxModalOpen(true);

		// const { CollateralShort } = synthetixjs!.contracts;

		// const { method, params } = getMethodAndParams();

		// try {
		setIsRedeeming(true);

		// let transaction: ethers.ContractTransaction | null = null;

		// const gasPriceWei = gasPriceInWei(gasPrice);

		// const gasLimitEstimate = await getGasLimitEstimate();

		// transaction = (await CollateralShort[method](...params, {
		// 	gasPrice: gasPriceWei,
		// 	gasLimit: gasLimitEstimate,
		// })) as ethers.ContractTransaction;

		// if (transaction != null) {
		// 	monitorTransaction({
		// 		txHash: transaction.hash,
		// 	});

		// 	await transaction.wait();
		// }
		// setRedeemTxModalOpen(false);
		// } catch (e) {
		// 	try {
		// 		await CollateralShort.callStatic[method](...params);
		// 		throw e;
		// 	} catch (e) {
		// 		console.log(e);
		// 		setTxError(
		// 			e.data
		// 				? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) })
		// 				: e.message
		// 		);
		// 	}
		// } finally {
		// 	setIsRedeeming(false);
		// }
	};

	const handleDismiss = () => {
		setRedeemTxModalOpen(false);
		setIsRedeeming(false);
	};

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
