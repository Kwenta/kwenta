import {
	FC,
	useState,
	useMemo,
	useEffect,
	useCallback,
	ReactNode,
	Dispatch,
	SetStateAction,
} from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';

import { Synths } from 'constants/currency';
import ROUTES from 'constants/routes';

import { formatCurrency } from 'utils/formatters/number';

import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

import TxApproveModal from 'sections/shared/modals/TxApproveModal';

import { getExchangeRatesForCurrencies, synthToContractName } from 'utils/currencies';
import { normalizeGasLimit, gasPriceInWei, getTransactionPrice } from 'utils/network';

import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	walletAddressState,
} from 'store/wallet';
import { NoTextTransform } from 'styles/common';
import media from 'styles/media';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import Card from 'components/Card';
import Button from 'components/Button';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
	MessageContainer,
} from 'sections/exchange/FooterCard/common';

import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';
import TotalTradePriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/TotalTradePriceSummaryItem';

import { ShortingTab } from './constants';
import TransactionNotifier from 'containers/TransactionNotifier';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { isL2State } from 'store/wallet';

type ManageShortActionProps = {
	short: ShortPosition;
	tab: ShortingTab;
	isActive: boolean;
	refetchShortPosition: () => void;
	inputAmount: string;
	setInputAmount: Dispatch<SetStateAction<string>>;
};

const ManageShortAction: FC<ManageShortActionProps> = ({
	short,
	tab,
	isActive,
	refetchShortPosition,
	inputAmount,
	setInputAmount,
}) => {
	const { t } = useTranslation();
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txApproveModalOpen, setTxApproveModalOpen] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthsMap, synthetixjs } = Connector.useContainer();
	const isL2 = useRecoilValue(isL2State);

	const {
		useEthGasPriceQuery,
		useSynthsBalancesQuery,
		useExchangeRatesQuery,
		useFeeReclaimPeriodQuery,
	} = useSynthetixQueries();

	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const customGasPrice = useRecoilValue(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const collateralShortDataQuery = useCollateralShortContractInfoQuery();
	const issueFeeRate = collateralShortDataQuery.isSuccess
		? collateralShortDataQuery?.data?.issueFeeRate ?? null
		: null;

	const router = useRouter();

	const isAddCollateralTab = useMemo(() => tab === ShortingTab.AddCollateral, [tab]);
	const isRemoveCollateralTab = useMemo(() => tab === ShortingTab.RemoveCollateral, [tab]);
	const isCollateralTab = useMemo(() => isAddCollateralTab || isRemoveCollateralTab, [
		isAddCollateralTab,
		isRemoveCollateralTab,
	]);

	const isDecreasePositionTab = useMemo(() => tab === ShortingTab.DecreasePosition, [tab]);

	const needsApproval = useMemo(() => isAddCollateralTab, [isAddCollateralTab]);

	const isCloseTab = useMemo(() => tab === ShortingTab.ClosePosition, [tab]);

	const currencyKey = useMemo(
		() => (isCollateralTab ? short.collateralLocked : short.synthBorrowed),
		[isCollateralTab, short.collateralLocked, short.synthBorrowed]
	);

	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(currencyKey, walletAddress);

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.isSuccess
		? feeReclaimPeriodQuery.data ?? 0
		: 0;

	const balance = synthsWalletBalancesQuery.data?.balancesMap[currencyKey]?.balance ?? null;
	const inputAmountBN = wei(inputAmount || 0);

	const redirectToShortingHome = useCallback(() => router.push(ROUTES.Shorting.Home), [router]);

	const getMethodAndParams = useCallback(() => {
		const idParam = `${short.id}`;
		const amountParam = inputAmountBN.toBN() as ethers.BigNumber;

		let params: Array<ethers.BigNumber | string>;
		let method: string = '';
		let onSuccess: Function | null = null;

		switch (tab) {
			case ShortingTab.AddCollateral:
				params = [walletAddress!, idParam, amountParam];
				method = 'deposit';
				break;
			case ShortingTab.RemoveCollateral:
				params = [idParam, amountParam];
				method = 'withdraw';
				break;
			case ShortingTab.DecreasePosition:
				params = [walletAddress!, idParam, amountParam];
				method = 'repay';
				break;
			case ShortingTab.IncreasePosition:
				params = [idParam, amountParam];
				method = 'draw';
				break;
			case ShortingTab.ClosePosition:
				params = [idParam];
				method = isL2 ? 'closeWithCollateral' : 'close'; // closeWithCollateral only available on L2
				onSuccess = () => redirectToShortingHome();
				break;
			default:
				throw new Error('unrecognized tab');
		}
		return { method, params, onSuccess };
	}, [inputAmountBN, short.id, tab, walletAddress, redirectToShortingHome, isL2]);

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
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);

	const totalToRepay = useMemo(() => short.synthBorrowedAmount.add(short.accruedInterest), [
		short.accruedInterest,
		short.synthBorrowedAmount,
	]);

	const totalTradePrice = useMemo(() => {
		if (isCloseTab) {
			return wei(totalToRepay).mul(assetPriceRate).toString();
		}
		let tradePrice = inputAmountBN.mul(assetPriceRate);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.div(selectPriceCurrencyRate);
		}

		return tradePrice.toString();
	}, [inputAmountBN, assetPriceRate, selectPriceCurrencyRate, isCloseTab, totalToRepay]);

	const submissionDisabledReason: ReactNode = useMemo(() => {
		if (isCloseTab) {
			if (feeReclaimPeriodInSeconds > 0) {
				return t('exchange.summary-info.button.fee-reclaim-period');
			}
			if (!isL2 && balance != null && totalToRepay.gt(balance)) {
				return t(
					'shorting.history.manage-short.sections.close-position.button.insufficient-balance-to-repay'
				);
			}
		} else {
			if (!isWalletConnected || inputAmountBN.lte(0)) {
				return t('exchange.summary-info.button.enter-amount');
			}
			if (isSubmitting) {
				return t('exchange.summary-info.button.submitting-order');
			}
			if (isApproving) {
				return t('exchange.summary-info.button.approving');
			}
			if (isAddCollateralTab) {
				if (inputAmountBN.gt(balance ?? 0)) {
					return t('exchange.summary-info.button.insufficient-balance');
				}
			}
			if (isDecreasePositionTab) {
				if (inputAmountBN.gt(short.synthBorrowedAmount)) {
					return t(
						'shorting.history.manage-short.sections.decrease-position.button.amount-greater-than-debt'
					);
				}
				if (inputAmountBN.eq(short.synthBorrowedAmount)) {
					return t(
						'shorting.history.manage-short.sections.decrease-position.button.close-position-instead'
					);
				}
			}
			if (isRemoveCollateralTab) {
				if (inputAmountBN.gt(short.collateralLockedAmount)) {
					return t(
						'shorting.history.manage-short.sections.remove-collateral.button.amount-greater-than-collateral'
					);
				}
			}
		}
		return null;
	}, [
		feeReclaimPeriodInSeconds,
		isApproving,
		balance,
		isSubmitting,
		inputAmountBN,
		isWalletConnected,
		t,
		isRemoveCollateralTab,
		isDecreasePositionTab,
		isAddCollateralTab,
		short,
		isCloseTab,
		totalToRepay,
		isL2,
	]);

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const getGasLimitEstimate = useCallback(async (): Promise<number | null> => {
		try {
			const { CollateralShort } = synthetixjs!.contracts;

			const { method, params } = getMethodAndParams();
			const gasEstimate = await CollateralShort.estimateGas[method](...params);
			return normalizeGasLimit(Number(gasEstimate));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams, synthetixjs]);

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
		if (synthetixjs != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			const { CollateralShort } = synthetixjs!.contracts;

			const { method, params, onSuccess } = getMethodAndParams();

			try {
				setIsSubmitting(true);

				let transaction: ethers.ContractTransaction | null = null;

				const gasPriceWei = gasPriceInWei(gasPrice);

				const gasLimitEstimate = await getGasLimitEstimate();

				transaction = (await CollateralShort[method](...params, {
					gasPrice: gasPriceWei,
					gasLimit: gasLimitEstimate,
				})) as ethers.ContractTransaction;

				if (transaction != null) {
					monitorTransaction({
						txHash: transaction.hash,
					});

					await transaction.wait();
					setInputAmount('');
					if (onSuccess != null) {
						onSuccess();
					}
					refetchShortPosition();
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				try {
					await CollateralShort.callStatic[method](...params);
					throw e;
				} catch (e) {
					console.error(e);
					setTxError(e?.data?.message ?? 'Error');
				}
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const handleApprove = async () => {
		if (currencyKey != null && gasPrice != null) {
			setTxError(null);
			setTxApproveModalOpen(true);

			try {
				setIsApproving(true);

				const { contracts } = synthetixjs!;

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
					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							setIsApproving(false);
							setIsApproved(true);
						},
					});
				}
				setTxApproveModalOpen(false);
			} catch (e) {
				console.error(e);
				setIsApproving(false);
				setTxError(e?.data?.message ?? 'Error');
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
			return inputAmountBN.mul(issueFeeRate);
		}
		return null;
	}, [inputAmountBN, issueFeeRate]);

	const feeCost = useMemo(() => {
		if (issuanceFee != null) {
			return issuanceFee.mul(assetPriceRate);
		}
		return null;
	}, [issuanceFee, assetPriceRate]);

	const currency = currencyKey != null && synthsMap != null ? synthsMap[currencyKey] : null;

	const checkAllowance = useCallback(async () => {
		if (isWalletConnected && currencyKey != null && inputAmount) {
			try {
				const { contracts } = synthetixjs!;

				const allowance = (await contracts[synthToContractName(currencyKey)].allowance(
					walletAddress,
					contracts.CollateralShort.address
				)) as ethers.BigNumber;

				setIsApproved(wei(ethers.utils.formatEther(allowance)).gte(inputAmount));
			} catch (e) {
				console.log(e);
			}
		}
	}, [inputAmount, isWalletConnected, currencyKey, walletAddress, synthetixjs]);

	useEffect(() => {
		if (needsApproval) {
			checkAllowance();
		}
	}, [checkAllowance, needsApproval]);

	const closeTabSummaryItems = (
		<SummaryItems attached={false}>
			<GasPriceSummaryItem gasPrices={gasPrices} transactionFee={transactionFee} />
			<SummaryItem>
				<SummaryItemLabel>
					{t('shorting.history.manage-short.sections.close-position.total-to-replay-label')}
				</SummaryItemLabel>
				<SummaryItemValue>
					{formatCurrency(short.synthBorrowed, totalToRepay, {
						currencyKey: short.synthBorrowed,
					})}
				</SummaryItemValue>
			</SummaryItem>
			<TotalTradePriceSummaryItem totalTradePrice={totalTradePrice} />
		</SummaryItems>
	);

	const feeRate = // no fees for increasing and decreasing a position
		tab === ShortingTab.IncreasePosition || tab === ShortingTab.DecreasePosition
			? wei(0)
			: issueFeeRate;

	return (
		<Container>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={true} />
			) : (
				<>
					{isCloseTab ? (
						<>
							<MobileOrTabletView>
								<MobileCard className="trade-summary-card">
									<Card.Body>{closeTabSummaryItems}</Card.Body>
								</MobileCard>
							</MobileOrTabletView>
							<MessageContainer attached={false} className="footer-card">
								<DesktopOnlyView>{closeTabSummaryItems}</DesktopOnlyView>
								<Button
									variant="danger"
									isRounded={true}
									onClick={handleSubmit}
									size="lg"
									disabled={isSubmissionDisabled}
								>
									{isSubmissionDisabled
										? submissionDisabledReason
										: t('shorting.history.manage-short.sections.close-position.close-button-label')}
								</Button>
							</MessageContainer>
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
									isCollateralTab
										? t('shorting.history.manage-short.sections.panel.collateral')
										: t('shorting.history.manage-short.sections.panel.shorting')
								}
							/>
							<TradeSummaryCard
								attached={true}
								submissionDisabledReason={submissionDisabledReason}
								onSubmit={
									needsApproval ? (isApproved ? handleSubmit : handleApprove) : handleSubmit
								}
								totalTradePrice={totalTradePrice}
								baseCurrencyAmount={inputAmount}
								basePriceRate={assetPriceRate}
								baseCurrency={currency || null}
								gasPrices={gasPrices}
								feeReclaimPeriodInSeconds={0}
								quoteCurrencyKey={null}
								feeRate={feeRate}
								transactionFee={transactionFee}
								feeCost={feeCost}
								showFee={true}
								isApproved={needsApproval ? isApproved : true}
							/>
							{txApproveModalOpen && (
								<TxApproveModal
									onDismiss={() => setTxApproveModalOpen(false)}
									txError={txError}
									attemptRetry={handleApprove}
									currencyKey={currencyKey!}
									currencyLabel={<NoTextTransform>{currencyKey}</NoTextTransform>}
								/>
							)}
						</>
					)}
					{txConfirmationModalOpen && (
						<TxConfirmationModal
							onDismiss={() => setTxConfirmationModalOpen(false)}
							txError={txError}
							attemptRetry={handleSubmit}
							baseCurrencyAmount={
								isCloseTab ? short.collateralLockedAmount.toString() : inputAmountBN.toString()
							}
							quoteCurrencyAmount={isCloseTab ? totalToRepay.toString() : undefined}
							baseCurrencyKey={isCloseTab ? short.collateralLocked : currencyKey}
							quoteCurrencyKey={isCloseTab ? short.synthBorrowed : undefined}
							totalTradePrice={totalTradePrice}
							txProvider="synthetix"
							feeCost={feeCost}
							baseCurrencyLabel={t(
								`shorting.history.manage-short.sections.${tab}.tx-confirm.base-currency-label`
							)}
							quoteCurrencyLabel={t(
								`shorting.history.manage-short.sections.${tab}.tx-confirm.quote-currency-label`
							)}
						/>
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

export const MobileCard = styled(Card)`
	margin: 0 auto 86px auto;
`;

export default ManageShortAction;
