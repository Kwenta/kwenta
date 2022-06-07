import useSynthetixQueries from '@synthetixio/queries';
import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Select from 'components/Select';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import { useRouter } from 'next/router';
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
import { getDisplayAsset, getMarketKey } from 'utils/futures';

type ReactSelectOptionProps = {
	label: string;
	synthIcon: string;
	marketRemainingMargin?: string;
	onClick?: () => {};
};

type FuturesPositionTableProps = {
	setShowUniswapWidget: Dispatch<SetStateAction<boolean>>;
	uniswapWidgetOpened: boolean;
};

const BalanceActions: FC<FuturesPositionTableProps> = ({
	uniswapWidgetOpened,
	setShowUniswapWidget,
}) => {
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
		position.remainingMargin.gt(zeroBN)
	);

	const totalRemainingMargin = accessiblePositions.reduce(
		(prev, position) => prev.add(position.remainingMargin),
		zeroBN
	);

	const setMarketConfig = (asset: string): ReactSelectOptionProps => {
		const remainingMargin =
			accessiblePositions.find((posittion) => posittion.asset === asset)?.remainingMargin ?? zeroBN;

		const marketKey = getMarketKey(asset, network.id);

		return {
			label: `${getDisplayAsset(asset)}-PERP`,
			synthIcon: marketKey,
			marketRemainingMargin: formatCurrency(Synths.sUSD, remainingMargin, { sign: '$' }),
			onClick: () => router.push(`/market/${asset}`),
		};
	};

	const OPTIONS = [
		{
			label: 'header.balance.total-margin-label',
			totalAvailableMargin: formatCurrency(Synths.sUSD, totalRemainingMargin, { sign: '$' }),
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
		marketRemainingMargin,
		onClick,
	}: ReactSelectOptionProps) => (
		<LabelContainer onClick={onClick}>
			<FlexDivRow>
				{synthIcon && <StyledCurrencyIcon currencyKey={synthIcon} width="24px" height="24px" />}
				<StyledLabel noPadding={!synthIcon}>{t(label)}</StyledLabel>
			</FlexDivRow>
			<Container>{marketRemainingMargin}</Container>
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
				<span>{t('header.balance.no-accessible-margin')}</span>
				<UniswapButton />
			</components.NoOptionsMessage>
		);
	};

	useEffect(() => {
		setBalanceLabel(formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' }));
	}, [balanceLabel, sUSDBalance]);

	useEffect(() => {
		synthsBalancesQuery.refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uniswapWidgetOpened]);

	if (!balanceLabel) {
		return null;
	}

	return (
		<Container>
			{sUSDBalance.eq(zeroBN) && accessiblePositions.length === 0 ? (
				<StyledWidgetButton
					textTransform="none"
					onClick={() => setShowUniswapWidget(true)}
					noOutline={true}
				>
					<StyledCurrencyIcon currencyKey={Synths.sUSD} width="20px" height="20px" />
					{t('header.balance.get-susd')}
				</StyledWidgetButton>
			) : (
				<BalanceSelect
					formatOptionLabel={formatOptionLabel}
					formatGroupLabel={OptionsGroupLabel}
					controlHeight={41}
					options={OPTIONS}
					value={{ label: balanceLabel, synthIcon: Synths.sUSD }}
					menuWidth={290}
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
					noOutline={true}
				></BalanceSelect>
			)}
		</Container>
	);
};

export default BalanceActions;

const Container = styled.div`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.mono};
`;

const BalanceSelect = styled(Select)<{ value: { label: string } }>`
	.react-select__control {
		width: ${(props) => 5 * props.value.label.length + 80}px;
	}

	.react-select__group {
		padding: 20px;

		.react-select__group-heading {
			color: ${(props) => props.theme.colors.selectedTheme.button.text};
			font-size: 12px;
			padding: 0;
			margin-bottom: 15px;
			text-transform: none;
		}
	}

	.react-select__value-container {
		padding: 0px;
		display: flex;
		justify-content: center;
	}

	.react-select__menu-notice--no-options {
		padding: 15px;
	}
`;

const StyledOptions = styled.div`
	border-radius: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 5px;
	height: auto;
	width: 20px;
`;

const StyledLabel = styled.div<{ noPadding: boolean }>`
	white-space: nowrap;
`;

const LabelContainer = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 13px;
	padding: 10px;
	> div {
		align-items: center;
	}
`;

const StyledButton = styled(Button)`
	width: 100%;
	height: 41px;
	font-size: 13px;
	margin-top: 15px;
	align-items: center;
`;

const StyledWidgetButton = styled(Button)`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
	padding: 10px;
	white-space: nowrap;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
