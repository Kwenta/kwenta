import { FC } from 'react';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NotificationContainer from 'constants/NotificationContainer';
import { ExchangeContext } from 'contexts/ExchangeContext';
import useExchange from 'hooks/useExchange';
import ExchangeContent from 'sections/exchange/ExchangeContent';
import ExchangeHead from 'sections/exchange/ExchangeHead';
// import AppLayout from 'sections/shared/Layout/AppLayout';
import Header from 'sections/shared/Layout/AppLayout/Header';
import { FullScreenContainer, MobileScreenContainer } from 'styles/common';

type ExchangeComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Exchange: ExchangeComponent = () => {
	const exchangeData = useExchange({
		showNoSynthsCard: false,
	});

	return (
		<ExchangeContext.Provider value={exchangeData}>
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
		</ExchangeContext.Provider>
	);
};

Exchange.getLayout = (page) => <>{page}</>;

export default Exchange;
