import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { Synths } from 'lib/synthetix';

import { Rates } from 'queries/rates/useExchangeRatesQuery';

import Currency from 'components/Currency';
import BaseModal from 'components/BaseModal';

import { SelectableCurrencyRow } from 'styles/common';

import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey, CurrencyKeys } from 'constants/currency';

import { fiatCurrencyState } from 'store/app';

import SearchInput from 'components/Input/SearchInput';

type SelectSynthModalProps = {
	onDismiss: () => void;
	synths: Synths;
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
			<SearchContainer>
				<StyledSearchInput placeholder={t('modals.select-synth.search.placeholder')} />
			</SearchContainer>
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

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

const SearchContainer = styled.div`
	margin: 0 16px 12px 16px;
`;
const StyledSearchInput = styled(SearchInput)`
	height: 40px;
	::placeholder {
		text-transform: capitalize;
	}
`;

export default SelectSynthModal;
