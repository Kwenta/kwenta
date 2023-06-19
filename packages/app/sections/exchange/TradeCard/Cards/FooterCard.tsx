import { SynthSymbol } from '@kwenta/sdk/data';
import { FC, memo } from 'react';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import { useAppSelector } from 'state/hooks';

import SettleTransactionsCard from '../../FooterCard/SettleTransactionsCard';

const FooterCard: FC = memo(() => {
	const { isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();
	const synthSuspensions = useAppSelector(({ exchange }) => exchange.synthSuspensions);

	const { quoteCurrencyKey, baseCurrencyKey, numEntries } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		numEntries: exchange.numEntries,
	}));

	const quoteMarketClosed = quoteCurrencyKey
		? synthSuspensions?.[quoteCurrencyKey as SynthSymbol]?.isSuspended
		: false;

	const baseMarketClosed = baseCurrencyKey
		? synthSuspensions?.[baseCurrencyKey as SynthSymbol]?.isSuspended
		: false;

	return (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard />
			) : baseMarketClosed || quoteMarketClosed ? (
				<MarketClosureCard />
			) : !isL2 && numEntries >= 12 ? (
				<SettleTransactionsCard />
			) : (
				<TradeSummaryCard />
			)}
		</>
	);
});

export default FooterCard;
