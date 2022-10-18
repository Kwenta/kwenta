import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import {
	checkNeedsApproval,
	fetchRates,
	fetchTxProvider,
	resetCurrencies,
} from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NotificationContainer from 'constants/NotificationContainer';
import Connector from 'containers/Connector';
import ExchangeContent from 'sections/exchange/ExchangeContent';
import ExchangeHead from 'sections/exchange/ExchangeHead';
// import AppLayout from 'sections/shared/Layout/AppLayout';
import Header from 'sections/shared/Layout/AppLayout/Header';
import { FullScreenContainer, MobileScreenContainer } from 'styles/common';

type ExchangeComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Exchange: ExchangeComponent = () => {
	const { network } = Connector.useContainer();
	const router = useRouter();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const quoteCurrencyFromQuery = router.query.quote as string | undefined;
		const baseCurrencyFromQuery = router.query.base as string | undefined;

		if (!!quoteCurrencyFromQuery || !!baseCurrencyFromQuery) {
			dispatch(resetCurrencies({ quoteCurrencyFromQuery, baseCurrencyFromQuery })).then(() => {
				dispatch(checkNeedsApproval());
				dispatch(fetchTxProvider());
				dispatch(fetchRates());
			});
		}
	}, [router.query.quote, router.query.base, network.id, dispatch]);

	return (
		<>
			<ExchangeHead />
			<DesktopOnlyView>
				<FullScreenContainer>
					<Header />
					<ExchangeContent />
					<NotificationContainer />
				</FullScreenContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileScreenContainer>
					<ExchangeContent />
				</MobileScreenContainer>
			</MobileOrTabletView>
		</>
	);
};

Exchange.getLayout = (page) => <>{page}</>;

export default Exchange;
