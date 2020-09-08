import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Synths, Synth } from 'lib/synthetix';

import { Rates } from 'queries/rates/useExchangeRatesQuery';

import Button from 'components/Button';
import Currency from 'components/Currency';
import BaseModal from 'components/BaseModal';
import SearchInput from 'components/Input/SearchInput';

import useDebouncedMemo from 'hooks/useDebouncedMemo';

import { SelectableCurrencyRow } from 'styles/common';

import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey, CATEGORY_MAP } from 'constants/currency';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';

import { RowsHeader, RowsContainer } from '../common';

export const CATEGORY_FILTERS = [
	CATEGORY_MAP.crypto,
	CATEGORY_MAP.forex,
	CATEGORY_MAP.equities,
	CATEGORY_MAP.commodity,
];

type SelectSynthModalProps = {
	onDismiss: () => void;
	synths: Synths;
	exchangeRates?: Rates;
	onSelect: (currencyKey: CurrencyKey) => void;
	frozenSynths: CurrencyKey[];
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

export const SelectSynthModal: FC<SelectSynthModalProps> = ({
	onDismiss,
	exchangeRates,
	synths,
	onSelect,
	frozenSynths,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();
	const [assetSearch, setAssetSearch] = useState<string>('');
	const [synthCategory, setSynthCategory] = useState<string | null>(null);

	const filteredSynths = useMemo(
		() =>
			synthCategory != null ? synths.filter((synth) => synth.category === synthCategory) : synths,
		[synths, synthCategory]
	);

	const searchFilteredSynths = useDebouncedMemo(
		() =>
			assetSearch
				? filteredSynths.filter(({ name, desc }) => {
						const assetSearchLC = assetSearch.toLowerCase();

						return (
							name.toLowerCase().includes(assetSearchLC) ||
							desc.toLowerCase().includes(assetSearchLC)
						);
				  })
				: filteredSynths,
		[filteredSynths, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	);

	const synthsResults = assetSearch ? searchFilteredSynths : filteredSynths;
	const totalSynths = synthsResults.length;

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-synth.title')}>
			<SearchContainer>
				<AssetSearchInput
					placeholder={t('modals.select-synth.search.placeholder')}
					onChange={(e) => {
						setSynthCategory(null);
						setAssetSearch(e.target.value);
					}}
					value={assetSearch}
					autoFocus={true}
				/>
			</SearchContainer>
			<CategoryFilters>
				{CATEGORY_FILTERS.map((category) => {
					const isActive = synthCategory === category;

					return (
						<CategoryButton
							variant="secondary"
							isActive={isActive}
							onClick={() => {
								setAssetSearch('');
								setSynthCategory(isActive ? null : category);
							}}
							key={category}
						>
							{t(`common.currency-category.${category}`)}
						</CategoryButton>
					);
				})}
			</CategoryFilters>
			<RowsHeader>
				{assetSearch ? (
					<>
						<span>{t('modals.select-synth.header.search-results')}</span>
						<span>{t('common.total-results', { total: totalSynths })}</span>
					</>
				) : (
					<>
						<span>
							{synthCategory != null
								? t('modals.select-synth.header.category-synths', { category: synthCategory })
								: t('modals.select-synth.header.all-synths')}
						</span>
						<span>{t('common.total-assets', { total: totalSynths })}</span>
					</>
				)}
			</RowsHeader>
			<RowsContainer>
				{synthsResults.map((synth) => {
					let price = exchangeRates && exchangeRates[synth.name];
					const isSelectable = !frozenSynths.includes(synth.name);
					const currencyKey = synth.name;

					if (price != null && selectPriceCurrencyRate != null) {
						price /= selectPriceCurrencyRate;
					}

					return (
						<StyledSelectableCurrencyRow
							key={currencyKey}
							onClick={
								isSelectable
									? () => {
											onSelect(currencyKey);
											onDismiss();
									  }
									: undefined
							}
							isSelectable={isSelectable}
						>
							<Currency.Name currencyKey={currencyKey} name={synth.desc} showIcon={true} />
							{price != null ? (
								<Currency.Price
									currencyKey={currencyKey}
									price={price}
									sign={selectedPriceCurrency.sign}
								/>
							) : (
								NO_VALUE
							)}
						</StyledSelectableCurrencyRow>
					);
				})}
			</RowsContainer>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
		padding: 16px 0;
		overflow: hidden;
	}
`;

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

const SearchContainer = styled.div`
	margin: 0 16px 12px 16px;
`;

const AssetSearchInput = styled(SearchInput)`
	font-size: 16px;
	height: 40px;
	font-family: ${(props) => props.theme.fonts.bold};
	::placeholder {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.silver};
	}
`;

const CategoryFilters = styled.div`
	display: grid;
	grid-auto-flow: column;
	justify-content: space-between;
	padding: 0 16px;
	margin-bottom: 18px;
`;

const CategoryButton = styled(Button)`
	text-transform: uppercase;
`;

export default SelectSynthModal;
