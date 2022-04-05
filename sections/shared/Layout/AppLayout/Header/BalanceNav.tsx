import useSynthetixQueries from '@synthetixio/queries';
import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Select from 'components/Select';
import { IndicatorSeparator } from 'components/Select/Select';
import { Synths } from 'constants/currency';
import { useRouter } from 'next/router';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { components } from 'react-select';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

type ReactSelectOptionProps = {
	label: string;
	synthIcon: string;
	link?: string;
	marketVolume?: string;
	isMenuLabel?: boolean;
	onClick?: () => {};
};

type BalanceNavProps = {};

const BalanceNav: FC<BalanceNavProps> = () => {
	const { t } = useTranslation();
	// const isL2 = useRecoilValue(isL2State);
	const theme = useTheme();
	const router = useRouter();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const futuresMarketsQuery = useGetFuturesMarkets();

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;
	const balanceIsZero = sUSDBalance === zeroBN;
	const balanceLabel = formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' });

	const perpetualLabel = useCallback((synth: string) => {
		return (synth[0] === 's' ? synth.slice(1) : synth) + '-PERP';
	}, []);

	const getMarketSize = useCallback(
		(synth: string): string | undefined => {
			const futuresMarkets = futuresMarketsQuery?.data ?? [];
			const market = futuresMarkets.find(({ asset }) => asset === synth) ?? null;

			if (market) {
				return formatCurrency(Synths.sUSD, market.marketSize, { sign: '$' });
			} else {
				const assets = futuresMarkets.map(({ asset }) => asset);
				console.log(`could not find market for synth ${synth} in ${assets}`);
			}
		},
		[futuresMarketsQuery?.data]
	);

	const synthMarkets = [
		{
			label: perpetualLabel(Synths.sETH),
			synthIcon: Synths.sETH,
			marketVolume: getMarketSize(Synths.sETH),
			onClick: () => router.push(`/market/${Synths.sETH}`),
		},
		{
			label: perpetualLabel(Synths.sBTC),
			synthIcon: Synths.sBTC,
			marketVolume: getMarketSize(Synths.sBTC),
			onClick: () => router.push(`/market/${Synths.sBTC}`),
		},
		{
			label: perpetualLabel(Synths.sLINK),
			synthIcon: Synths.sLINK,
			marketVolume: getMarketSize(Synths.sLINK),
			onClick: () => router.push(`/market/${Synths.sLINK}`),
		},
	];

	const OPTIONS = balanceIsZero ? [{ label: 'header.balance.1inch' }] : synthMarkets;

	const formatOptionLabel = ({
		label,
		synthIcon,
		marketVolume,
		onClick,
		isMenuLabel,
	}: ReactSelectOptionProps) => (
		<LabelContainer noPadding={isMenuLabel} onClick={onClick}>
			<FlexDivRow>
				{synthIcon && <StyledCurrencyIcon currencyKey={synthIcon} />}
				<StyledLabel>{t(label)}</StyledLabel>
			</FlexDivRow>
			{marketVolume}
		</LabelContainer>
	);

	const DropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<StyledCaretDownIcon
					src={CaretDownIcon}
					viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`}
				/>
			</components.DropdownIndicator>
		);
	};

	return (
		<Container>
			<BalanceSelect
				formatOptionLabel={formatOptionLabel}
				controlHeight={41}
				options={OPTIONS}
				value={{ label: balanceLabel, synthIcon: Synths.sUSD, isMenuLabel: true }}
				menuWidth={240}
				optionPadding={'0px'} //override default padding to 0
				optionBorderBottom={`1px solid ${theme.colors.navy}`}
				dropdownIndicatorColor={theme.colors.blueberry}
				dropdownIndicatorColorHover={theme.colors.blueberry}
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
			></BalanceSelect>
		</Container>
	);
};

export default BalanceNav;

const Container = styled.div`
	width: 100%;
	font-size: 12px;
	font-family: AkkuratMonoLLWeb-Regular;
`;

const BalanceSelect = styled(Select)`
	min-width: 150px;

	.react-select__control {
		border-radius: 10px;
	}

	.react-select__dropdown-indicator {
		margin-right: 5px;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 5px;
`;

const StyledCaretDownIcon = styled(Svg)`
	width: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StyledLabel = styled.div`
	padding-top: 5px;
`;

const LabelContainer = styled(FlexDivRowCentered)<{ noPadding: boolean }>`
	color: ${(props) => props.theme.colors.white};
	padding: ${(props) => !props.noPadding && '16px'};
	font-size: 13px;
`;
