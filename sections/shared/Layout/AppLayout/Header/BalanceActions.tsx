import { useRouter } from 'next/router';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { components } from 'react-select';
import styled from 'styled-components';

import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import Select from 'components/Select';
import { FuturesAccountTypes } from 'queries/futures/types';
import { FuturesPosition } from 'sdk/types/futures';
import { selectSusdBalance } from 'state/balances/selectors';
import { setFuturesAccountType } from 'state/futures/reducer';
import {
	selectCrossMarginPositions,
	selectFuturesPortfolio,
	selectIsolatedMarginPositions,
} from 'state/futures/selectors';
import { useAppSelector, useAppDispatch } from 'state/hooks';
import { zeroBN, formatDollars } from 'utils/formatters/number';
import { getMarketName, MarketKeyByAsset } from 'utils/futures';

type ReactSelectOptionProps = {
	label: string;
	synthIcon: string;
	marketRemainingMargin?: string;
	onClick?: () => {};
};

const GetUsdButton = memo(() => {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<StyledButton textTransform="none" onClick={() => router.push(`/exchange/?quote=sUSD`)}>
			{t('header.balance.get-more-susd')}
		</StyledButton>
	);
});

const Group: FC<any> = memo(({ children, ...props }) => (
	<components.Group {...props}>
		<StyledOptions>{children}</StyledOptions>
		<GetUsdButton />
	</components.Group>
));

const NoOptionsMessage: FC<any> = memo((props) => {
	const { t } = useTranslation();

	return (
		<components.NoOptionsMessage {...props}>
			<span>{t('header.balance.no-accessible-margin')}</span>
			<GetUsdButton />
		</components.NoOptionsMessage>
	);
});

const BalanceActions: FC = () => {
	const [balanceLabel, setBalanceLabel] = useState('');
	const { t } = useTranslation();
	const router = useRouter();

	const crossPositions = useAppSelector(selectCrossMarginPositions);
	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const susdWalletBalance = useAppSelector(selectSusdBalance);
	const dispatch = useAppDispatch();

	const setMarketConfig = useCallback(
		(position: FuturesPosition, accountType: FuturesAccountTypes) => ({
			label: getMarketName(position.asset),
			synthIcon: MarketKeyByAsset[position.asset],
			marketRemainingMargin: formatDollars(position.remainingMargin),
			onClick: () => {
				// TODO: Remove eventually
				dispatch(setFuturesAccountType(accountType));
				return router.push(`/market/?asset=${position.asset}&accountType=${accountType}`);
			},
		}),
		[dispatch, router]
	);

	const options = useMemo(() => {
		const isolatedPositionsFiltered = isolatedPositions
			.filter((position) => position.remainingMargin.gt(zeroBN))
			.map((position) => setMarketConfig(position, FuturesAccountTypes.ISOLATED_MARGIN));
		const crossPositionsFiltered = crossPositions
			.filter((position) => position.remainingMargin.gt(zeroBN))
			.map((position) => setMarketConfig(position, FuturesAccountTypes.CROSS_MARGIN));
		return [
			{
				label: 'header.balance.total-margin-label',
				totalAvailableMargin: formatDollars(portfolio.total),
				options: [...isolatedPositionsFiltered, ...crossPositionsFiltered],
			},
		];
	}, [crossPositions, isolatedPositions, setMarketConfig, portfolio]);

	const OptionsGroupLabel: FC<{ label: string; totalAvailableMargin?: string }> = ({
		label,
		totalAvailableMargin,
	}) => (
		<FlexDivRow>
			<Container>{t(label)}</Container>
			<Container>{totalAvailableMargin}</Container>
		</FlexDivRow>
	);

	const formatOptionLabel: FC<ReactSelectOptionProps> = ({
		label,
		synthIcon,
		marketRemainingMargin,
		onClick,
	}: ReactSelectOptionProps) => (
		<LabelContainer onClick={onClick}>
			<FlexDivRow>
				{synthIcon && <StyledCurrencyIcon currencyKey={synthIcon} width="24px" height="24px" />}
				<StyledLabel>{t(label)}</StyledLabel>
			</FlexDivRow>
			<Container>{marketRemainingMargin}</Container>
		</LabelContainer>
	);

	useEffect(() => {
		setBalanceLabel(formatDollars(susdWalletBalance, { sign: '$' }));
	}, [balanceLabel, susdWalletBalance]);

	if (!balanceLabel) {
		return null;
	}

	return (
		<Container>
			{susdWalletBalance.eq(zeroBN) && options.length === 0 ? (
				<StyledWidgetButton
					textTransform="none"
					onClick={() => router.push(`/exchange/?quote=sUSD`)}
					noOutline
					mono
				>
					<StyledCurrencyIcon currencyKey="sUSD" width="20px" height="20px" />
					{t('header.balance.get-susd')}
				</StyledWidgetButton>
			) : (
				<BalanceSelect
					formatOptionLabel={formatOptionLabel}
					formatGroupLabel={OptionsGroupLabel}
					controlHeight={41}
					options={options}
					value={{ label: balanceLabel, synthIcon: 'sUSD' }}
					menuWidth={290}
					maxMenuHeight={500}
					optionPadding="0px"
					components={{
						Group,
						NoOptionsMessage,
						DropdownIndicator: undefined,
						IndicatorSeparator: undefined,
					}}
					isSearchable={false}
					variant="flat"
				/>
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
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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

	.react-select__option {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
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

const StyledLabel = styled.div`
	white-space: nowrap;
`;

const LabelContainer = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 13px;
	line-height: 13px;
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
	height: 41px;
	font-size: 13px;
	padding: 10px;
	white-space: nowrap;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
