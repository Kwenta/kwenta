import { wei } from '@synthetixio/wei';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { useExchangeContext } from 'contexts/ExchangeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import {
	baseCurrencyKeyState,
	quoteCurrencyKeyState,
	baseCurrencyAmountState,
	quoteCurrencyAmountState,
	currencyPairState,
} from 'store/exchange';
import { truncateNumbers } from 'utils/formatters/number';
import CurrencyCard from '../CurrencyCard';
import { CurrencyKey } from 'constants/currency';

type QuoteCurrencyCardProps = {
	allowQuoteCurrencySelection?: boolean;
};

const QuoteCurrencyCard: React.FC<QuoteCurrencyCardProps> = ({ allowQuoteCurrencySelection }) => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const setBaseCurrencyAmount = useSetRecoilState(baseCurrencyAmountState);
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useRecoilState(quoteCurrencyAmountState);
	const setCurrencyPair = useSetRecoilState(currencyPairState);

	const {
		txProvider,
		quoteCurrencyBalance,
		openModal,
		setOpenModal,
		routeToMarketPair,
		allTokensMap,
		exchangeFeeRate,
		quotePriceRate,
		rate,
	} = useExchangeContext();

	return (
		<>
			<CurrencyCard
				side="quote"
				currencyKey={quoteCurrencyKey}
				currencyName={quoteCurrencyKey ? allTokensMap[quoteCurrencyKey]?.name : null}
				amount={quoteCurrencyAmount}
				onAmountChange={async (value) => {
					if (value === '') {
						setQuoteCurrencyAmount('');
						setBaseCurrencyAmount('');
					} else {
						setQuoteCurrencyAmount(value);
						if (txProvider === 'synthetix' && baseCurrencyKey != null) {
							const baseCurrencyAmountNoFee = wei(value).mul(rate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
							setBaseCurrencyAmount(
								truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
							);
						}
					}
				}}
				walletBalance={quoteCurrencyBalance}
				onBalanceClick={async () => {
					if (quoteCurrencyBalance != null) {
						if ((quoteCurrencyKey as string) === 'ETH') {
							const ETH_TX_BUFFER = 0.1;
							const balanceWithBuffer = quoteCurrencyBalance.sub(wei(ETH_TX_BUFFER));
							setQuoteCurrencyAmount(
								balanceWithBuffer.lt(0)
									? '0'
									: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS)
							);
						} else {
							setQuoteCurrencyAmount(
								truncateNumbers(quoteCurrencyBalance, DEFAULT_CRYPTO_DECIMALS)
							);
						}
						if (txProvider === 'synthetix') {
							const baseCurrencyAmountNoFee = quoteCurrencyBalance.mul(rate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
							setBaseCurrencyAmount(
								truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
							);
						}
					}
				}}
				onCurrencySelect={
					allowQuoteCurrencySelection ? () => setOpenModal('quote-select') : undefined
				}
				priceRate={quotePriceRate}
				label={t('exchange.common.from')}
				txProvider={txProvider}
			/>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');

						setCurrencyPair((pair) => ({
							base: pair.base === currencyKey ? null : pair.base,
							quote: currencyKey as CurrencyKey,
						}));
						if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
							routeToMarketPair(baseCurrencyKey, currencyKey);
						}
					}}
				/>
			)}
		</>
	);
};

export default QuoteCurrencyCard;
