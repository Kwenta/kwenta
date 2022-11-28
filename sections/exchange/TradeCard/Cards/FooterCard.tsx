import { FC, memo } from 'react';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import useMarketClosed from 'hooks/useMarketClosed';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import { selectCanRedeem } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';

import SettleTransactionsCard from '../../FooterCard/SettleTransactionsCard';
import RedeemButton from './RedeemButton';

const FooterCard: FC = memo(() => {
	const { isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();

	const { quoteCurrencyKey, baseCurrencyKey, numEntries } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		numEntries: exchange.numEntries,
	}));

	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey ?? null);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey ?? null);

	const canRedeem = useAppSelector(selectCanRedeem);

	return (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard />
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard />
			) : !isL2 && numEntries >= 12 ? (
				<SettleTransactionsCard />
			) : canRedeem ? (
				<RedeemButton />
			) : (
				<TradeSummaryCard />
			)}
		</>
	);
});

export default FooterCard;
