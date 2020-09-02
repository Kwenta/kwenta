import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Rates } from 'queries/rates/useExchangeRatesQuery';
import { SynthDefinitions } from 'lib/snxContracts';

import BaseModal from 'components/BaseModal';
import { FlexDivRowCentered, SelectableCurrencyRow } from 'styles/common';
import { CurrencyKey, CurrencyKeys } from 'constants/currency';
import Currency from 'components/Currency';
import { useRecoilValue } from 'recoil';
import { fiatCurrencyState } from 'store/app';
import { NO_VALUE } from 'constants/placeholder';

type SelectSynthModalProps = {
	onDismiss: () => void;
	synths: SynthDefinitions;
	exchangeRates?: Rates;
	onSelect: (currencyKey: CurrencyKey) => void;
	frozenSynths: CurrencyKeys;
};

export const SelectSynthModal: FC<SelectSynthModalProps> = ({
	onDismiss,
	exchangeRates,
	synths,
	onSelect,
	frozenSynths,
}) => {
	const { t } = useTranslation();
	const fiatCurrency = useRecoilValue(fiatCurrencyState);

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-synth.title')}>
			{synths.map((synth) => {
				const price = exchangeRates && exchangeRates[synth.name];
				const isSelectable = !frozenSynths.includes(synth.name);

				return (
					<StyledSelectableCurrencyRow
						key={synth.name}
						onClick={
							isSelectable
								? () => {
										onSelect(synth.name);
										onDismiss();
								  }
								: undefined
						}
						isSelectable={isSelectable}
					>
						<Currency.Name currencyKey={synth.name} name={synth.desc} showIcon={true} />
						{price != null ? <Currency.Price price={price} sign={fiatCurrency.sign} /> : NO_VALUE}
					</StyledSelectableCurrencyRow>
				);
			})}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 384px;
	}
	.card-body {
		max-height: 80vh;
		overflow: auto;
		padding: 16px 0;
	}
`;

const PaddingMixin = `
	padding: 5px 16px;
`;

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	${PaddingMixin};
`;

export default SelectSynthModal;
