import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { Observable } from 'rxjs';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';

import synthetix from 'lib/synthetix';
import {
	SynthetixEvents,
	ExchangeRatesEvents,
	SystemStatusEvents,
	SynthExchangeEvent,
	SynthResumedEvent,
	SynthSuspendedEvent,
	RatesUpdatedEvent,
} from 'lib/contracts/events';

import { appReadyState } from 'store/app';

const useServices = () => {
	const isAppReady = useRecoilValue(appReadyState);
	const { provider } = Connector.useContainer();
	const [blockNumber$, setBlockNumber$] = useState<Observable<number> | null>(null);
	const [ratesUpdated$, setRatesUpdated$] = useState<Observable<RatesUpdatedEvent> | null>(null);
	const [synthExchange$, setSynthExchange$] = useState<Observable<SynthExchangeEvent> | null>(null);
	const [systemSuspended$, setSystemSuspended$] = useState<Observable<SynthSuspendedEvent> | null>(
		null
	);
	const [systemResumed$, setSystemResumed$] = useState<Observable<SynthResumedEvent> | null>(null);

	useEffect(() => {
		if (isAppReady && provider) {
			const blockObservable$ = new Observable<number>((subscriber) => {
				provider.on('block', (blockNumber: number) => {
					subscriber.next(blockNumber);
				});
			});

			setBlockNumber$(blockObservable$);
		}
	}, [isAppReady, provider]);

	useEffect(() => {
		if (isAppReady && synthetix.js) {
			const { ExchangeRates, SystemStatus, Synthetix } = synthetix.js.contracts;

			const ratesUpdated$ = new Observable<RatesUpdatedEvent>((subscriber) => {
				ExchangeRates.on(
					ExchangeRatesEvents.RATES_UPDATED,
					(currencyKeys: RatesUpdatedEvent['currencyKeys'], rates: RatesUpdatedEvent['rates']) =>
						subscriber.next({
							currencyKeys,
							rates,
						})
				);
			});

			const synthExchange$ = new Observable<SynthExchangeEvent>((subscriber) => {
				Synthetix.on(
					SynthetixEvents.SYNTH_EXCHANGE,
					(
						fromAddress: SynthExchangeEvent['fromAddress'],
						fromCurrencyKey: SynthExchangeEvent['fromCurrencyKey'],
						fromAmount: SynthExchangeEvent['fromAmount'],
						toCurrencyKey: SynthExchangeEvent['toCurrencyKey'],
						toAmount: SynthExchangeEvent['toAmount'],
						toAddress: SynthExchangeEvent['toAddress']
					) =>
						subscriber.next({
							fromAddress,
							fromCurrencyKey,
							fromAmount,
							toCurrencyKey,
							toAmount,
							toAddress,
						})
				);
			});

			const systemSuspended$ = new Observable<SynthSuspendedEvent>((subscriber) => {
				SystemStatus.on(SystemStatusEvents.SYSTEM_SUSPENDED, (reason: number) =>
					subscriber.next({ reason })
				);
			});

			const systemResumed$ = new Observable<SynthResumedEvent>((subscriber) => {
				SystemStatus.on(SystemStatusEvents.SYSTEM_RESUMED, (reason: number) =>
					subscriber.next({ reason })
				);
			});

			setRatesUpdated$(ratesUpdated$);
			setSynthExchange$(synthExchange$);
			setSystemSuspended$(systemSuspended$);
			setSystemResumed$(systemResumed$);
		}
	}, [isAppReady]);

	return {
		blockNumber$,
		ratesUpdated$,
		synthExchange$,
		systemSuspended$,
		systemResumed$,
	};
};

const Services = createContainer(useServices);

export default Services;
