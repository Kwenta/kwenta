import { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';
import Notify from 'containers/Notify';

import synthetix from 'lib/synthetix';

import { DEFAULT_TOKEN_DECIMALS, SYNTHS_MAP } from 'constants/currency';
import ROUTES from 'constants/routes';

import { formatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';

import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useCollateralShortDataQuery from 'queries/collateral/useCollateralShortDataQuery';
import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';

import TxApproveModal from 'sections/shared/modals/TxApproveModal';

import { getExchangeRatesForCurrencies, synthToContractName } from 'utils/currencies';
import { normalizeGasLimit, gasPriceInWei, getTransactionPrice } from 'utils/network';

import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';
import TotalTradePriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/TotalTradePriceSummaryItem';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	walletAddressState,
} from 'store/wallet';
import { NoTextTransform } from 'styles/common';
import media from 'styles/media';

import Button from 'components/Button';

import { SubmissionDisabledReason } from 'sections/exchange/FooterCard/common';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
	MessageContainer,
} from 'sections/exchange/FooterCard/common';

import { ShortingTab } from './ManageShort';

type ManageShortActionProps = {
	short: ShortPosition;
	tab: ShortingTab;
	isActive: boolean;
	refetchShortPosition: () => void;
};

const ManageShortAction: FC<ManageShortActionProps> = ({
	short,
	tab,
	isActive,
	refetchShortPosition,
}) => {
	const { t } = useTranslation();
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txApproveModalOpen, setTxApproveModalOpen] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [inputAmount, setInputAmount] = useState<string>('');
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const { notify } = Connector.useContainer();
	const { monitorHash } = Notify.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const customGasPrice = useRecoilValue(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const collateralShortDataQuery = useCollateralShortDataQuery(short.synthBorrowed);
	const issueFeeRate = collateralShortDataQuery.isSuccess
		? collateralShortDataQuery?.data?.issueFeeRate ?? null
		: null;

	const router = useRouter();
	const needsApproval = useMemo(() => tab === ShortingTab.AddCollateral, [tab]);

	const isCollateralChange = useMemo(
		() => [ShortingTab.AddCollateral, ShortingTab.RemoveCollateral].includes(tab),
		[tab]
	);

	const isCloseTab = useMemo(() => tab === ShortingTab.ClosePosition, [tab]);

	const currencyKey = isCollateralChange ? short.collateralLocked : short.synthBorrowed;

	const balance = synthsWalletBalancesQuery.data?.balancesMap[currencyKey]?.balance ?? null;

	const inputAmountBN = useMemo(() => toBigNumber(inputAmount || 0), [inputAmount]);

	const redirectToShortingHome = useCallback(() => router.push(ROUTES.Shorting.Home), [router]);

	const getMethodAndParams = useCallback(
		({ isEstimate }: { isEstimate: boolean }) => {
			const idParam = `${short.id}`;
			const amountParam = ethers.utils.parseUnits(inputAmountBN.toString(), DEFAULT_TOKEN_DECIMALS);

			let params: Array<ethers.BigNumber | string>;
			let contractFunc: ethers.ContractFunction;
			let onSuccess: Function | null = null;

			const { CollateralShort } = synthetix.js!.contracts;

			switch (tab) {
				case ShortingTab.AddCollateral:
					params = [walletAddress!, idParam, amountParam];
					contractFunc = isEstimate ? CollateralShort.estimateGas.deposit : CollateralShort.deposit;
					break;
				case ShortingTab.RemoveCollateral:
					params = [idParam, amountParam];
					contractFunc = isEstimate
						? CollateralShort.estimateGas.withdraw
						: CollateralShort.withdraw;
					break;
				case ShortingTab.DecreasePosition:
					params = [walletAddress!, idParam, amountParam];
					contractFunc = isEstimate ? CollateralShort.estimateGas.repay : CollateralShort.repay;
					break;
				case ShortingTab.IncreasePosition:
					params = [idParam, amountParam];
					contractFunc = isEstimate ? CollateralShort.estimateGas.draw : CollateralShort.draw;
					break;
				case ShortingTab.ClosePosition:
					params = [idParam];
					contractFunc = isEstimate ? CollateralShort.estimateGas.close : CollateralShort.close;
					onSuccess = () => redirectToShortingHome();
					break;
				default:
					throw new Error('unrecognized tab');
			}
			return { contractFunc, params, onSuccess };
		},
		[inputAmountBN, short.id, tab, walletAddress, redirectToShortingHome]
	);

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const assetPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, currencyKey, selectedPriceCurrency.name),
		[exchangeRates, currencyKey, selectedPriceCurrency.name]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, SYNTHS_MAP.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const synthCollateralPriceRate = useMemo(
		() =>
			getExchangeRatesForCurrencies(
				exchangeRates,
				short.collateralLocked,
				selectedPriceCurrency.name
			),
		[exchangeRates, short.collateralLocked, selectedPriceCurrency.name]
	);

	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);

	const totalTradePrice = useMemo(() => {
		if (isCloseTab) {
			return toBigNumber(synthCollateralPriceRate)
				.multipliedBy(short.collateralLockedAmount)
				.toString();
		}
		if (inputAmountBN.isNaN()) {
			return zeroBN.toString();
		}
		let tradePrice = inputAmountBN.multipliedBy(assetPriceRate);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.dividedBy(selectPriceCurrencyRate);
		}

		return tradePrice.toString();
	}, [
		inputAmountBN,
		assetPriceRate,
		selectPriceCurrencyRate,
		isCloseTab,
		short.collateralLockedAmount,
		synthCollateralPriceRate,
	]);

	const submissionDisabledReason: SubmissionDisabledReason | null = useMemo(() => {
		if (!isWalletConnected || inputAmountBN.isNaN() || inputAmountBN.lte(0)) {
			return 'enter-amount';
		}
		if (inputAmountBN.gt(balance ?? 0)) {
			return 'insufficient-balance';
		}
		if (isSubmitting) {
			return 'submitting-order';
		}
		if (isApproving) {
			return 'approving';
		}
		return null;
	}, [isApproving, balance, isSubmitting, inputAmountBN, isWalletConnected]);

	const getGasLimitEstimate = useCallback(async (): Promise<number | null> => {
		try {
			const { contractFunc, params } = getMethodAndParams({ isEstimate: true });
			const gasEstimate = await contractFunc(...params);
			return normalizeGasLimit(Number(gasEstimate));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams]);

	useEffect(() => {
		async function updateGasLimit() {
			if (!isActive) {
				setGasLimit(null);
			} else if (isActive && gasLimit == null && submissionDisabledReason == null) {
				const newGasLimit = await getGasLimitEstimate();
				setGasLimit(newGasLimit);
			}
		}
		updateGasLimit();
	}, [submissionDisabledReason, gasLimit, isActive, getGasLimitEstimate]);

	const handleSubmit = async () => {
		if (synthetix.js != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			try {
				setIsSubmitting(true);

				let transaction: ethers.ContractTransaction | null = null;

				const gasPriceWei = gasPriceInWei(gasPrice);

				const gasLimitEstimate = await getGasLimitEstimate();

				const { contractFunc, params, onSuccess } = getMethodAndParams({ isEstimate: false });

				transaction = (await contractFunc(...params, {
					gasPrice: gasPriceWei,
					gasLimit: gasLimitEstimate,
				})) as ethers.ContractTransaction;

				if (transaction != null && notify != null) {
					monitorHash({
						txHash: transaction.hash,
					});

					await transaction.wait();
					if (onSuccess != null) {
						onSuccess();
					}
					refetchShortPosition();
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const approve = async () => {
		if (currencyKey != null && gasPrice != null) {
			setTxError(null);
			setTxApproveModalOpen(true);

			try {
				setIsApproving(true);

				const { contracts } = synthetix.js!;

				const collateralContract = contracts[synthToContractName(currencyKey)];

				const gasEstimate = await collateralContract.estimateGas.approve(
					contracts.CollateralShort.address,
					ethers.constants.MaxUint256
				);
				const gasPriceWei = gasPriceInWei(gasPrice);

				const tx = await collateralContract.approve(
					contracts.CollateralShort.address,
					ethers.constants.MaxUint256,
					{
						gasLimit: normalizeGasLimit(Number(gasEstimate)),
						gasPrice: gasPriceWei,
					}
				);
				if (tx != null) {
					monitorHash({
						txHash: tx.hash,
						onTxConfirmed: () => {
							setIsApproving(false);
							setIsApproved(true);
						},
					});
				}
				setTxApproveModalOpen(false);
			} catch (e) {
				console.log(e);
				setIsApproving(false);
				setTxError(e.message);
			}
		}
	};

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const issuanceFee = useMemo(() => {
		if (issueFeeRate != null && inputAmountBN.gt(0)) {
			return inputAmountBN.multipliedBy(issueFeeRate);
		}
		return null;
	}, [inputAmountBN, issueFeeRate]);

	const feeCost = useMemo(() => {
		if (issuanceFee != null) {
			return issuanceFee.multipliedBy(assetPriceRate);
		}
		return null;
	}, [issuanceFee, assetPriceRate]);

	const currency =
		currencyKey != null && synthetix.synthsMap != null ? synthetix.synthsMap[currencyKey] : null;

	const checkAllowance = useCallback(async () => {
		if (isWalletConnected && currencyKey != null && inputAmount) {
			try {
				const { contracts } = synthetix.js!;

				const allowance = (await contracts[synthToContractName(currencyKey)].allowance(
					walletAddress,
					contracts.CollateralShort.address
				)) as ethers.BigNumber;

				setIsApproved(toBigNumber(ethers.utils.formatEther(allowance)).gte(inputAmount));
			} catch (e) {
				console.log(e);
			}
		}
	}, [inputAmount, isWalletConnected, currencyKey, walletAddress]);

	useEffect(() => {
		if (needsApproval) {
			checkAllowance();
		}
	}, [checkAllowance, needsApproval]);

	return (
		<Container>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={true} />
			) : (
				<>
					{isCloseTab ? (
						<>
							<MessageContainer attached={false} className="footer-card">
								<SummaryItems attached={false}>
									<GasPriceSummaryItem gasPrices={gasPrices} transactionFee={transactionFee} />
									<SummaryItem>
										<SummaryItemLabel>
											{t(
												'shorting.history.manageShort.sections.close-position.total-to-replay-label'
											)}
										</SummaryItemLabel>
										<SummaryItemValue>
											{formatCurrency(short.synthBorrowed, short.synthBorrowedAmount, {
												currencyKey: short.synthBorrowed,
											})}
										</SummaryItemValue>
									</SummaryItem>
									<TotalTradePriceSummaryItem totalTradePrice={totalTradePrice} />
								</SummaryItems>
								<Button variant="danger" isRounded={true} onClick={handleSubmit} size="lg">
									{t('shorting.history.manageShort.sections.close-position.close-button-label')}
								</Button>
							</MessageContainer>
							{txConfirmationModalOpen && (
								<TxConfirmationModal
									onDismiss={() => setTxConfirmationModalOpen(false)}
									txError={txError}
									attemptRetry={handleSubmit}
									baseCurrencyAmount={`${short.collateralLockedAmount}`}
									quoteCurrencyAmount={`${short.synthBorrowedAmount}`}
									feeAmountInBaseCurrency={null}
									baseCurrencyKey={short.collateralLocked}
									quoteCurrencyKey={short.synthBorrowed}
									totalTradePrice={totalTradePrice}
									txProvider="synthetix"
									baseCurrencyLabel={t(
										`shorting.history.manageShort.sections.${tab}.tx-confirm.base-currency-label`
									)}
									quoteCurrencyLabel={t(
										`shorting.history.manageShort.sections.${tab}.tx-confirm.quote-currency-label`
									)}
								/>
							)}
						</>
					) : (
						<>
							<CurrencyCard
								side="base"
								currencyKey={currencyKey}
								amount={inputAmount}
								onAmountChange={setInputAmount}
								walletBalance={balance}
								onBalanceClick={() => (balance != null ? setInputAmount(balance.toString()) : null)}
								priceRate={assetPriceRate}
								label={
									isCollateralChange
										? t('shorting.history.manageShort.sections.panel.collateral')
										: t('shorting.history.manageShort.sections.panel.shorting')
								}
							/>
							<TradeSummaryCard
								attached={true}
								submissionDisabledReason={submissionDisabledReason}
								onSubmit={needsApproval ? (isApproved ? handleSubmit : approve) : handleSubmit}
								totalTradePrice={totalTradePrice}
								baseCurrencyAmount={inputAmount}
								basePriceRate={assetPriceRate}
								baseCurrency={currency}
								gasPrices={gasPrices}
								feeReclaimPeriodInSeconds={0}
								quoteCurrencyKey={null}
								feeRate={issueFeeRate}
								transactionFee={transactionFee}
								feeCost={feeCost}
								showFee={true}
								isApproved={needsApproval ? isApproved : true}
							/>
							{txApproveModalOpen && (
								<TxApproveModal
									onDismiss={() => setTxApproveModalOpen(false)}
									txError={txError}
									attemptRetry={approve}
									currencyKey={currencyKey!}
									currencyLabel={<NoTextTransform>{currencyKey}</NoTextTransform>}
								/>
							)}
							{txConfirmationModalOpen && (
								<TxConfirmationModal
									onDismiss={() => setTxConfirmationModalOpen(false)}
									txError={txError}
									attemptRetry={handleSubmit}
									baseCurrencyAmount={inputAmountBN.toString()}
									feeAmountInBaseCurrency={null}
									baseCurrencyKey={currencyKey}
									totalTradePrice={totalTradePrice}
									txProvider="synthetix"
									baseCurrencyLabel={t(
										`shorting.history.manageShort.sections.${tab}.tx-confirm.base-currency-label`
									)}
									quoteCurrencyLabel={t(
										`shorting.history.manageShort.sections.${tab}.tx-confirm.quote-currency-label`
									)}
								/>
							)}
						</>
					)}
				</>
			)}
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	.footer-card {
		max-width: unset;
	}

	.currency-card {
		${media.lessThan('md')`
			margin-bottom: 20px;
		`};
	}
`;

export default ManageShortAction;
