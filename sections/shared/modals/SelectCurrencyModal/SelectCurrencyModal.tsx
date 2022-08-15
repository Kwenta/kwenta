import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';

import Button from 'components/Button';
import Loader from 'components/Loader';
import SearchInput from 'components/Input/SearchInput';

import useDebouncedMemo from 'hooks/useDebouncedMemo';

import { FlexDivCentered, BottomShadow } from 'styles/common';

import { CurrencyKey, CATEGORY_MAP } from 'constants/currency';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';

import { RowsHeader, RowsContainer, CenteredModal } from '../common';

import SynthRow from './SynthRow';
import useSynthetixQueries from '@synthetixio/queries';
import { walletAddressState } from 'store/wallet';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';

export const CATEGORY_FILTERS = [CATEGORY_MAP.crypto, CATEGORY_MAP.forex, CATEGORY_MAP.commodity];

type SelectCurrencyModalProps = {
	onDismiss: () => void;
	onSelect: (currencyKey: CurrencyKey) => void;
	synthsOverride?: Array<CurrencyKey>;
};

export const SelectCurrencyModal: FC<SelectCurrencyModalProps> = ({
	onDismiss,
	onSelect,
	synthsOverride,
}) => {
	const { t } = useTranslation();

	const { synthetixjs } = Connector.useContainer();

	const [assetSearch, setAssetSearch] = useState<string>('');
	const [synthCategory, setSynthCategory] = useState<string | null>(null);

	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const walletAddress = useRecoilValue(walletAddressState);

	// eslint-disable-next-line
	const allSynths = synthetixjs?.synths ?? [];
	const synths =
		synthsOverride != null
			? allSynths.filter((synth) => synthsOverride.includes(synth.name as CurrencyKey))
			: allSynths;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances = synthsWalletBalancesQuery.isSuccess
		? synthsWalletBalancesQuery.data ?? null
		: null;

	const categoryFilteredSynths = useMemo(
		() =>
			synthCategory != null ? synths.filter((synth) => synth.category === synthCategory) : synths,
		[synths, synthCategory]
	);

	const searchFilteredSynths = useDebouncedMemo(
		() =>
			assetSearch
				? categoryFilteredSynths.filter(({ name, description }) => {
						const assetSearchLC = assetSearch.toLowerCase();

						return (
							name.toLowerCase().includes(assetSearchLC) ||
							description.toLowerCase().includes(assetSearchLC)
						);
				  })
				: categoryFilteredSynths,
		[categoryFilteredSynths, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	);

	const synthsResults = useMemo(() => {
		const synthsList = assetSearch ? searchFilteredSynths : categoryFilteredSynths;
		if (synthsWalletBalancesQuery.isSuccess) {
			return orderBy(
				synthsList,
				(synth) => {
					const synthBalance = synthBalances?.balancesMap[synth.name as CurrencyKey];
					return synthBalance != null ? synthBalance.usdBalance.toNumber() : 0;
				},
				'desc'
			);
		}
		return synthsList;
	}, [
		assetSearch,
		searchFilteredSynths,
		categoryFilteredSynths,
		synthsWalletBalancesQuery.isSuccess,
		synthBalances,
	]);

	return (
		<StyledCenteredModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.select-currency.title')}
		>
			<SearchContainer>
				<AssetSearchInput
					placeholder={t('modals.select-currency.search.placeholder')}
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
				<span>
					{assetSearch ? (
						<span>{t('modals.select-currency.header.search-results')}</span>
					) : synthCategory != null ? (
						t('modals.select-currency.header.category-synths', {
							category: synthCategory,
						})
					) : (
						t('modals.select-currency.header.all-synths')
					)}
				</span>
				<span>{t('modals.select-currency.header.holdings')}</span>
			</RowsHeader>
			<RowsContainer>
				{synthsWalletBalancesQuery.isLoading ? (
					<Loader />
				) : synthsResults.length > 0 ? (
					// TODO: use `Synth` type from contracts-interface
					synthsResults.map((synth: any) => {
						const currencyKey = synth.name;

						return (
							<SynthRow
								key={currencyKey}
								onClick={() => {
									onSelect(currencyKey as CurrencyKey);
									onDismiss();
								}}
								synthBalance={synthBalances?.balancesMap[currencyKey as CurrencyKey]}
								{...{ synth }}
							/>
						);
					})
				) : (
					<EmptyDisplay>{t('modals.select-currency.search.empty-results')}</EmptyDisplay>
				)}
			</RowsContainer>
			<StyledBottomShadow />
		</StyledCenteredModal>
	);
};

const StyledBottomShadow = styled(BottomShadow)`
	position: absolute;
	height: 32px;
`;

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
		padding: 16px 0;
		overflow: hidden;
	}
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
	justify-content: flex-start;
	column-gap: 10px;
	padding: 0 16px;
	margin-bottom: 18px;
`;

const CategoryButton = styled(Button)`
	text-transform: uppercase;
`;

const EmptyDisplay = styled(FlexDivCentered)`
	justify-content: center;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
	margin: 24px 0px;
	height: 50px;
	color: ${(props) => props.theme.colors.white};
`;

export default SelectCurrencyModal;
