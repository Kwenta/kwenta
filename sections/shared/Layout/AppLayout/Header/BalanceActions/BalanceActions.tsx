import useSynthetixQueries from '@synthetixio/queries';
import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Select from 'components/Select';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import { useRouter } from 'next/router';
import { FuturesPosition, FuturesMarket } from 'queries/futures/types';
import { Dispatch, SetStateAction } from 'react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { components, GroupProps } from 'react-select';
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
	futuresMarkets: FuturesMarket[];
	futuresPositions: FuturesPosition[];
	setShowUniswapWidget: Dispatch<SetStateAction<boolean>>;
};

const BalanceActions: FC<FuturesPositionTableProps> = ({
	futuresMarkets,
	futuresPositions,
	setShowUniswapWidget,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const router = useRouter();
	const { network } = Connector.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const balanceLabel = formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' });

	const totalRemainingMargin = futuresPositions.reduce(
		(prev, position) => prev.add(position.remainingMargin),
		zeroBN
	);

	const setMarketConfig = (asset: string) => {
		const remainingMargin =
			futuresPositions.find((posittion) => posittion.asset === asset)?.remainingMargin ?? zeroBN;

		const marketKey = getMarketKey(asset, network.id);

		return {
			label: `${getDisplayAsset(asset, network.id)}-PERP`,
			synthIcon: marketKey,
			marketRemainingMargin: formatCurrency(Synths.sUSD, remainingMargin, { sign: '$' }),
			onClick: () => router.push(`/market/${marketKey}`),
		};
	};

	const OPTIONS = [
		{
			label: 'header.balance.margin-label',
			totalAvailableMargin: formatCurrency(Synths.sUSD, totalRemainingMargin, { sign: '$' }),
			options: futuresMarkets.map((market) => setMarketConfig(market.asset)),
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
		<LabelContainer noPadding={synthIcon === 'sUSD'} onClick={onClick}>
			<FlexDivRow>
				{synthIcon && <StyledCurrencyIcon currencyKey={synthIcon} />}
				<StyledLabel noPadding={!synthIcon}>{t(label)}</StyledLabel>
			</FlexDivRow>
			<Container>{marketRemainingMargin}</Container>
		</LabelContainer>
	);

	const Group: FC<GroupProps<any>> = ({ children, ...props }) => (
		<components.Group {...props}>
			<StyledOptions>{children}</StyledOptions>
			<StyledButton onClick={() => setShowUniswapWidget(true)}>
				{t('header.balance.get-more-susd')}
			</StyledButton>
		</components.Group>
	);

	return (
		<Container>
			<BalanceSelect
				formatOptionLabel={formatOptionLabel}
				formatGroupLabel={OptionsGroupLabel}
				controlHeight={41}
				options={OPTIONS}
				value={{ label: balanceLabel, synthIcon: Synths.sUSD }}
				menuWidth={350}
				optionPadding={'0px'} //override default padding to 0
				optionBorderBottom={theme.colors.selectedTheme.border}
				components={{ Group, DropdownIndicator: () => null, IndicatorSeparator: () => null }}
				isSearchable={false}
			></BalanceSelect>
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
		min-width: ${(props) => props.value.label.length * 5 + 100}px;
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
`;

const StyledLabel = styled.div<{ noPadding: boolean }>`
	padding-top: ${(props) => !props.noPadding && '5px'};
	white-space: nowrap;
`;

const LabelContainer = styled(FlexDivRowCentered)<{ noPadding: boolean }>`
	color: ${(props) => props.theme.colors.white};
	padding: ${(props) => !props.noPadding && '6px'};
	font-size: 13px;
	padding: 10px;
`;

const StyledButton = styled(Button)`
	width: 100%;
	font-size: 13px;
	margin-top: 10px;
	align-items: center;
`;
