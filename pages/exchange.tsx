import React from 'react';

import { ExchangeContext } from 'contexts/ExchangeContext';
import useExchange from 'hooks/useExchange';
import ExchangeContent from 'sections/exchange/ExchangeContent';
import ExchangeHead from 'sections/exchange/ExchangeHead';
import AppLayout from 'sections/shared/Layout/AppLayout';

type ExchangeComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Exchange: ExchangeComponent = () => {
	const exchangeData = useExchange({
		showNoSynthsCard: false,
	});

	return (
		<ExchangeContext.Provider value={exchangeData}>
			<ExchangeHead />
			<ExchangeContent />
		</ExchangeContext.Provider>
	);
};

Exchange.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Exchange;
