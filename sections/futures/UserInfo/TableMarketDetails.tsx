import { ReactElement } from 'react';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { FuturesMarketKey } from 'sdk/types/futures';

export default function TableMarketDetails({
	marketKey,
	marketName,
	infoLabel,
	badge,
}: {
	marketKey: FuturesMarketKey;
	marketName: string;
	infoLabel?: string;
	badge?: ReactElement;
}) {
	return (
		<MarketContainer>
			<IconContainer>
				<StyledCurrencyIcon currencyKey={marketKey} />
			</IconContainer>
			<StyledText>
				{marketName}
				{badge}
			</StyledText>
			<StyledValue>{infoLabel}</StyledValue>
		</MarketContainer>
	);
}

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;
