import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import { wei } from '@synthetixio/wei';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';

import {
	baseCurrencyKeyState,
	baseCurrencyAmountState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	currencyPairState,
} from 'store/exchange';
import { truncateNumbers } from 'utils/formatters/number';
import CurrencyCard from '../CurrencyCard';
import { CurrencyKey } from 'constants/currency';

type BaseCurrencyCardProps = {
	allowBaseCurrencySelection?: boolean;
};

const BaseCurrencyCard: React.FC<BaseCurrencyCardProps> = ({ allowBaseCurrencySelection }) => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useRecoilState(baseCurrencyAmountState);
	const setQuoteCurrencyAmount = useSetRecoilState(quoteCurrencyAmountState);
	const setCurrencyPair = useSetRecoilState(currencyPairState);

	const {
		txProvider,
		inverseRate,
		baseCurrencyBalance,
		openModal,
		setOpenModal,
		slippagePercent,
		routeToBaseCurrency,
		routeToMarketPair,
		basePriceRate,
		allTokensMap,
		exchangeFeeRate,
		oneInchQuoteQuery,
	} = useExchangeContext();

	return (
		<>
			<CurrencyCard
				side="base"
				currencyKey={baseCurrencyKey}
				currencyName={baseCurrencyKey ? allTokensMap[baseCurrencyKey]?.name : null}
				disabled={txProvider !== 'synthetix'}
				amount={baseCurrencyAmount}
				onAmountChange={async (value) => {
					if (value === '') {
						setBaseCurrencyAmount('');
						setQuoteCurrencyAmount('');
					} else {
						setBaseCurrencyAmount(value);
						if (txProvider === 'synthetix' && baseCurrencyKey != null) {
							const quoteCurrencyAmountNoFee = wei(value).mul(inverseRate);
							const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
							setQuoteCurrencyAmount(
								truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
							);
						}
					}
				}}
				walletBalance={baseCurrencyBalance}
				onBalanceClick={async () => {
					if (baseCurrencyBalance != null) {
						setBaseCurrencyAmount(truncateNumbers(baseCurrencyBalance, DEFAULT_CRYPTO_DECIMALS));

						if (txProvider === 'synthetix') {
							const baseCurrencyAmountNoFee = baseCurrencyBalance.mul(inverseRate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
							setQuoteCurrencyAmount(
								truncateNumbers(baseCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
							);
						}
					}
				}}
				onCurrencySelect={
					allowBaseCurrencySelection ? () => setOpenModal('base-select') : undefined
				}
				priceRate={basePriceRate}
				label={t('exchange.common.into')}
				slippagePercent={slippagePercent}
				isLoading={txProvider === '1inch' && oneInchQuoteQuery.isFetching}
				txProvider={txProvider}
			/>
			{openModal === 'base-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={(currencyKey) => {
						setQuoteCurrencyAmount('');
						setCurrencyPair((pair) => ({
							base: currencyKey as CurrencyKey,
							quote: pair.quote === currencyKey ? null : pair.quote,
						}));

						if (quoteCurrencyKey != null) {
							if (quoteCurrencyKey !== currencyKey) {
								routeToMarketPair(currencyKey, quoteCurrencyKey);
							}
						} else {
							routeToBaseCurrency(currencyKey);
						}
					}}
				/>
			)}
		</>
	);
};

export default BaseCurrencyCard;
