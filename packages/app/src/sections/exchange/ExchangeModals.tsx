import { useRouter } from 'next/router'
import { memo, useCallback } from 'react'

import ROUTES from 'constants/routes'
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal'
import {
	changeBaseCurrencyKey,
	changeQuoteCurrencyKey,
	updateBaseAmount,
} from 'state/exchange/actions'
import { setOpenModal } from 'state/exchange/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const ExchangeModals = memo(() => {
	const dispatch = useAppDispatch()

	const router = useRouter()

	const routeToMarketPair = useCallback(
		(baseCurrencyKey: string, quoteCurrencyKey: string) =>
			router.replace(ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey), undefined, {
				shallow: true,
			}),
		[router]
	)

	const routeToBaseCurrency = useCallback(
		(baseCurrencyKey: string) =>
			router.replace(ROUTES.Exchange.Into(baseCurrencyKey), undefined, {
				shallow: true,
			}),
		[router]
	)

	const { openModal, quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		openModal: exchange.openModal,
	}))

	const closeModal = useCallback(() => {
		dispatch(setOpenModal(undefined))
	}, [dispatch])

	const onBaseCurrencyChange = useCallback(
		async (currencyKey: string) => {
			await dispatch(changeBaseCurrencyKey(currencyKey))
			await dispatch(updateBaseAmount())

			if (!!quoteCurrencyKey && quoteCurrencyKey !== currencyKey) {
				routeToMarketPair(currencyKey, quoteCurrencyKey)
			} else {
				routeToBaseCurrency(currencyKey)
			}
		},
		[quoteCurrencyKey, routeToBaseCurrency, routeToMarketPair, dispatch]
	)

	const onQuoteCurrencyChange = useCallback(
		async (currencyKey: string) => {
			await dispatch(changeQuoteCurrencyKey(currencyKey))

			if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
				routeToMarketPair(baseCurrencyKey, currencyKey)
			}
		},
		[baseCurrencyKey, routeToMarketPair, dispatch]
	)

	return (
		<>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal onDismiss={closeModal} onSelect={onQuoteCurrencyChange} />
			)}

			{openModal === 'base-select' && (
				<SelectCurrencyModal onDismiss={closeModal} onSelect={onBaseCurrencyChange} />
			)}
		</>
	)
})

export default ExchangeModals
