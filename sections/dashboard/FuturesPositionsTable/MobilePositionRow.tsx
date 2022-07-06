import React from 'react';
import styled, { css } from 'styled-components';
import { PositionSide } from 'sections/futures/types';
import Currency from 'components/Currency';
import { formatNumber } from 'utils/formatters/number';
import { getDisplayAsset, isEurForex } from 'utils/futures';
import { Synths } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { border } from 'components/Button';

type MobilePositionRowProps = {
	row: any;
	onClick(): void;
};

const MobilePositionRow: React.FC<MobilePositionRowProps> = ({ row, onClick }) => {
	return (
		<OpenPositionContainer side={row.position} key={row.asset} onClick={onClick}>
			<div style={{ display: 'flex' }}>
				<StyledCurrencyIcon currencyKey={row.marketKey} />
				<div>
					<OpenPositionSize>
						{formatNumber(row.size ?? 0)}
						<OpenPositionMarketName>{getDisplayAsset(row.asset)}</OpenPositionMarketName>
					</OpenPositionSize>
					<OpenPositionSide side={row.position ?? PositionSide.LONG}>
						<span className="side">{row.position ?? PositionSide.LONG}</span>{' '}
						<span className="at">@</span>{' '}
						<span className="leverage">{formatNumber(row.leverage ?? 0, { maxDecimals: 1 })}x</span>
					</OpenPositionSide>
				</div>
			</div>
			<div>
				<div>
					<Currency.Price
						currencyKey={Synths.sUSD}
						price={row.price ?? 0}
						sign="$"
						formatOptions={isEurForex(row.asset) ? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS } : {}}
					/>
				</div>
				<EntryPrice>
					<Currency.Price
						currencyKey={Synths.sUSD}
						price={row.avgEntryPrice ?? 0}
						sign="$"
						formatOptions={isEurForex(row.asset) ? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS } : {}}
					/>
				</EntryPrice>
			</div>
			<div>
				<ChangePercent value={row.pnlPct ?? 0} />
				<div>
					<Currency.Price currencyKey={Synths.sUSD} price={row.pnl ?? 0} sign="$" />
				</div>
			</div>
		</OpenPositionContainer>
	);
};

const OpenPositionContainer = styled.div<{ side?: PositionSide }>`
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	display: flex;
	justify-content: space-between;
	margin: 15px 0;
	padding: 10px;
	border-radius: 8px;
	box-sizing: border-box;
	position: relative;

	${border};

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			&::before {
				background: linear-gradient(
					180deg,
					rgba(127, 212, 130, 0.5) 0%,
					rgba(50, 111, 52, 0.5) 100%
				);
			}
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			&::before {
				background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.5) 0%,
					rgba(147, 54, 54, 0.5) 100%
				);
			}
		`}
`;

const OpenPositionSize = styled.div`
	display: flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	font-size: 12px;
`;

const OpenPositionMarketName = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gold};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.gold};
	border-radius: 4px;
	font-size: 6px;
	padding: 2px;
	margin-left: 4px;
`;

const OpenPositionSide = styled.div<{ side: PositionSide }>`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};

	.side {
		text-transform: uppercase;
		color: ${(props) =>
			props.side === PositionSide.LONG
				? props.theme.colors.selectedTheme.green
				: props.theme.colors.selectedTheme.red};
	}

	.at {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	.leverage {
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
`;

const EntryPrice = styled.div`
	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

export default MobilePositionRow;
