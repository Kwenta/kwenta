import useSynthetixQueries from '@synthetixio/queries';
import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Select from 'components/Select';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import { useRouter } from 'next/router';
import { FuturesPosition } from 'queries/futures/types';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { components } from 'react-select';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset, getMarketAssetFromKey, getMarketKey } from 'utils/futures';

type ReactSelectOptionProps = {
	label: string;
	synthIcon: string;
	marketAccessibleMargin?: string;
	onClick?: () => {};
};

type FuturesPositionTableProps = {
	setShowUniswapWidget: Dispatch<SetStateAction<boolean>>;
};

const BalanceActions: FC<FuturesPositionTableProps> = ({ setShowUniswapWidget }) => {
	const [balanceLabel, setBalanceLabel] = useState('');
	const { t } = useTranslation();
	const theme = useTheme();
	const router = useRouter();
	const { network } = Connector.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const futuresPositionQuery = useGetFuturesPositionForMarkets(
		futuresMarkets.map(({ asset }) => getMarketKey(asset, network.id))
	);
	const futuresPositions = futuresPositionQuery?.data ?? [];

	const accessiblePositions = futuresPositions.filter((position) =>
		position.accessibleMargin.gt(zeroBN)
	);

	const totalAccessibleMargin = accessiblePositions.reduce(
		(prev, position) => prev.add(position.accessibleMargin),
		zeroBN
	);

	const setMarketConfig = (asset: string): ReactSelectOptionProps => {
		const accessibleMargin =
			futuresPositions.find((posittion) => posittion.asset === asset)?.accessibleMargin ?? zeroBN;

		const routePath = getMarketAssetFromKey(asset, network.id);

		return {
			label: `${getDisplayAsset(asset)}-PERP`,
			synthIcon: asset,
			marketAccessibleMargin: formatCurrency(Synths.sUSD, accessibleMargin, { sign: '$' }),
			onClick: () => router.push(`/market/${routePath}`),
		};
	};

	const OPTIONS = [
		{
			label: 'header.balance.margin-label',
			totalAvailableMargin: formatCurrency(Synths.sUSD, totalAccessibleMargin, { sign: '$' }),
			options: accessiblePositions.map((market) => setMarketConfig(market.asset)),
		},
	];

	const OptionsGroupLabel: FC<{
		label: string;
		totalAvailableMargin?: string;
	}> = ({ label, totalAvailableMargin }) => {
		return (
			<FlexDivRow>
				<Container>{t(label)}</Container>
				<Container>{totalAvailableMargin}</Container>
			</FlexDivRow>
		);
	};

	const formatOptionLabel = ({
		label,
		synthIcon,
		marketAccessibleMargin,
		onClick,
	}: ReactSelectOptionProps) => (
		<LabelContainer noPadding={synthIcon === 'sUSD'} onClick={onClick}>
			<FlexDivRow>
				{synthIcon && <StyledCurrencyIcon currencyKey={synthIcon} />}
				<StyledLabel noPadding={!synthIcon}>{t(label)}</StyledLabel>
			</FlexDivRow>
			<Container>{marketAccessibleMargin}</Container>
		</LabelContainer>
	);

	const UniswapButton = () => (
		<StyledButton textTransform="none" onClick={() => setShowUniswapWidget(true)}>
			{t('header.balance.get-more-susd')}
		</StyledButton>
	);

	const Group: FC<any> = ({ children, ...props }) => (
		<components.Group {...props}>
			<StyledOptions>{children}</StyledOptions>
			<UniswapButton />
		</components.Group>
	);

	const NoOptionsMessage: FC<any> = (props) => {
		return (
			<components.NoOptionsMessage {...props}>
				{t('header.balance.no-accessible-margin')}
				<UniswapButton />
			</components.NoOptionsMessage>
		);
	};

	useEffect(() => {
		setBalanceLabel(formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' }));
	}, [balanceLabel, sUSDBalance]);

	if (!balanceLabel) {
		return null;
	}

	return (
		<Container>
			{sUSDBalance === zeroBN ? (
				<StyledWidgetButton textTransform="none" onClick={() => setShowUniswapWidget(true)}>
					<StyledCurrencyIcon currencyKey={Synths.sUSD} />
					{t('header.balance.get-susd')}
				</StyledWidgetButton>
			) : (
				<BalanceSelect
					formatOptionLabel={formatOptionLabel}
					formatGroupLabel={OptionsGroupLabel}
					controlHeight={41}
					options={OPTIONS}
					value={{ label: balanceLabel, synthIcon: Synths.sUSD }}
					menuWidth={350}
					maxMenuHeight={500}
					optionPadding={'0px'} //override default padding to 0
					optionBorderBottom={theme.colors.selectedTheme.border}
					components={{
						Group,
						NoOptionsMessage,
						DropdownIndicator: () => null,
						IndicatorSeparator: () => null,
					}}
					isSearchable={false}
				></BalanceSelect>
			)}
		</Container>
	);
};

export default BalanceActions;

const Container = styled.div`
	font-size: 12px;
	font-family: AkkuratMonoLLWeb-Regular;
`;

const BalanceSelect = styled(Select)<{ value: { label: string } }>`
	.react-select__control {
		width: ${(props) => 5 * props.value.label.length + 90}px;
	}

	.react-select__group {
		margin: 20px;
		padding-top: 0px;
		padding-bottom: 0px;

		.react-select__group-heading {
			color: ${(props) => props.theme.colors.white};
			font-size: 12px;
			margin-bottom: 20px;
			padding-left: 0px;
			padding-right: 0px;
			text-transform: none;
		}
	}

	.react-select__menu-list {
		::-webkit-scrollbar {
			width: 0; /* Remove scrollbar space */
			background: transparent; /* Optional: just make scrollbar invisible */
		}
	}

	.react-select__value-container {
		padding: 0px;
		display: flex;
		justify-content: center;
	}
`;

const StyledOptions = styled.div`
	border-radius: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 5px;
	height: 22px;
	width: 22px;
`;

const StyledLabel = styled.div<{ noPadding: boolean }>`
	padding-top: 4px;
	white-space: nowrap;
`;

const LabelContainer = styled(FlexDivRowCentered)<{ noPadding: boolean }>`
	color: ${(props) => props.theme.colors.white};
	padding: 10px;
	font-size: 13px;
	padding: 10px;
`;

const StyledButton = styled(Button)`
	width: 100%;
	font-size: 13px;
	margin-top: 10px;
	align-items: center;
`;

const StyledWidgetButton = styled(Button)`
	font-size: 13px;
	padding: 10px;
	white-space: nowrap;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
