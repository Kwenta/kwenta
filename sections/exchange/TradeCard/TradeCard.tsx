import { Synth } from 'lib/synthetix';
import { FC, ChangeEvent } from 'react';

import { CurrencyKey } from 'constants/currency';

import CurrencyCard from './CurrencyCard';
import MarketDetailsCard from './MarketDetailsCard';
import PriceChartCard from './PriceChartCard';

import { Side } from './types';

type TradeCardProps = {
	side: Side;
	currencyKey: CurrencyKey;
	currencyAmount: string;
	walletBalance: number | null;
	onBalanceClick: () => void;
	onCurrencySelect: () => void;
	priceRate: number | null;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
	onAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TradeCard: FC<TradeCardProps> = ({
	side,
	currencyKey,
	currencyAmount,
	walletBalance,
	onBalanceClick,
	onCurrencySelect,
	priceRate,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
	onAmountChange,
}) => (
	<>
		<CurrencyCard
			side={side}
			currencyKey={currencyKey}
			amount={currencyAmount}
			onAmountChange={onAmountChange}
			walletBalance={walletBalance}
			onBalanceClick={onBalanceClick}
			onCurrencySelect={onCurrencySelect}
		/>
		<PriceChartCard
			currencyKey={currencyKey ?? null}
			priceRate={priceRate ?? null}
			selectedPriceCurrency={selectedPriceCurrency}
			selectPriceCurrencyRate={selectPriceCurrencyRate}
		/>
		<MarketDetailsCard
			currencyKey={currencyKey}
			selectedPriceCurrency={selectedPriceCurrency}
			selectPriceCurrencyRate={selectPriceCurrencyRate}
		/>
	</>
);

export default TradeCard;
