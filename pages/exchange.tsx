import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NotificationContainer from 'constants/NotificationContainer';
import ExchangeContent from 'sections/exchange/ExchangeContent';
import ExchangeHead from 'sections/exchange/ExchangeHead';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { fetchTokenList, resetCurrencies } from 'state/exchange/actions';
import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks';
import { selectNetwork } from 'state/wallet/selectors';
import { FullScreenContainer, MobileScreenContainer } from 'styles/common';

type ExchangeComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Exchange: ExchangeComponent = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const walletAddress = useAppSelector(({ wallet }) => wallet.walletAddress);
	const network = useAppSelector(selectNetwork);

	useFetchAction(fetchTokenList, { dependencies: [network] });

	useEffect(() => {
		const quoteCurrencyFromQuery = (router.query.quote as string | undefined) ?? 'sUSD';
		const baseCurrencyFromQuery = router.query.base as string | undefined;

		if (!!walletAddress && (!!quoteCurrencyFromQuery || !!baseCurrencyFromQuery)) {
			dispatch(resetCurrencies({ quoteCurrencyFromQuery, baseCurrencyFromQuery }));
		}
	}, [router.query, network, dispatch, walletAddress]);

	return (
		<>
			<ExchangeHead />
			<DesktopOnlyView>
				<FullScreenContainer>
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

Exchange.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Exchange;
