import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { Synths } from 'lib/synthetix';

import { Rates } from 'queries/rates/useExchangeRatesQuery';

import Currency from 'components/Currency';
import BaseModal from 'components/BaseModal';

import { SelectableCurrencyRow, FlexDivRowCentered, FlexDivRow } from 'styles/common';

import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey, CurrencyKeys, CATEGORY_MAP, Category } from 'constants/currency';

import { fiatCurrencyState } from 'store/app';

import SearchInput from 'components/Input/SearchInput';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';
import Button from 'components/Button';

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
	frozenSynths: CurrencyKeys;
	excludedSynths?: CurrencyKeys;
};

export const SelectSynthModal: FC<SelectSynthModalProps> = ({
	onDismiss,
	exchangeRates,
	synths,
	onSelect,
	frozenSynths,
	excludedSynths,
}) => {
	const { t } = useTranslation();
	const [assetSearch, setAssetSearch] = useState<string>('');
	const [synthCategory, setSynthCategory] = useState<string | null>(null);

	const fiatCurrency = useRecoilValue(fiatCurrencyState);

	const filteredSynths = useMemo(() => {
		const allSynths = excludedSynths
			? synths.filter((synth) => !excludedSynths.includes(synth.name))
			: synths;

		return synthCategory != null
			? allSynths.filter((synth) => synth.category === synthCategory)
			: allSynths;
	}, [synths, excludedSynths, synthCategory]);

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

	const synthsToRender = assetSearch ? searchFilteredSynths : filteredSynths;

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-synth.title')}>
			<SearchContainer>
				<AssetSearchInput
					placeholder={t('modals.select-synth.search.placeholder')}
					onChange={(e) => setAssetSearch(e.target.value)}
					value={assetSearch}
				/>
			</SearchContainer>
			<CategoryFilters>
				{CATEGORY_FILTERS.map((category) => {
					const isActive = synthCategory === category;

					return (
						<CategoryButton
							size="md"
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
			<SynthsRowsTitle>
				{assetSearch ? (
					<>
						<span>{t('modals.select-synth.header.search-results')}</span>
						<span>{t('common.total-results', { total: synthsToRender.length })}</span>
					</>
				) : (
					<>
						<span>
							{synthCategory != null
								? t('modals.select-synth.header.category-synths', { category: synthCategory })
								: t('modals.select-synth.header.all-synths')}
						</span>
						<span>{t('common.total-assets', { total: synthsToRender.length })}</span>
					</>
				)}
			</SynthsRowsTitle>
			<SynthRowsContainer>
				{synthsToRender.map((synth) => {
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
			</SynthRowsContainer>
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

const SynthRowsContainer = styled.div`
	overflow: auto;
	height: 100%;
`;

const SynthsRowsTitle = styled(FlexDivRow)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0 16px 9px 16px;
`;

export default SelectSynthModal;
