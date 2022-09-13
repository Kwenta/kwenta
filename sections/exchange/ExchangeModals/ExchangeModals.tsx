import React from 'react';

import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';

const ExchangeModals = React.memo(() => {
	const {
		openModal,
		setOpenModal,
		onQuoteCurrencyChange,
		onBaseCurrencyChange,
	} = useExchangeContext();

	return (
		<>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={onQuoteCurrencyChange}
				/>
			)}

			{openModal === 'base-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={onBaseCurrencyChange}
				/>
			)}
		</>
	);
});

export default ExchangeModals;
