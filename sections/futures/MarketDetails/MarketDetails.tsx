import React from 'react';
import styled, { css } from 'styled-components';

import { FlexDivCentered } from 'styles/common';
import media from 'styles/media';

import MarketsDropdown from '../Trade/MarketsDropdown';
import MarketDetail from './MarketDetail';
import MobileMarketDetail from './MobileMarketDetail';
import useGetMarketData from './useGetMarketData';

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const marketData = useGetMarketData(mobile);

	return (
		<FlexDivCentered>
			{!mobile && (
				<MarketDropDownContainer>
					<MarketsDropdown />
				</MarketDropDownContainer>
			)}

			<MarketDetailsContainer mobile={mobile}>
				{Object.entries(marketData).map(([marketKey, data]) => (
					<MarketDetail {...data} marketKey={marketKey} mobile={Boolean(mobile)}></MarketDetail>
				))}

				{mobile && <MobileMarketDetail />}
			</MarketDetailsContainer>
		</FlexDivCentered>
	);
};

const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	flex: 1;
	height: 55px;
	padding: 10px 45px 10px 15px;
	margin-bottom: 16px;
	box-sizing: border-box;
	overflow-x: scroll;
	scrollbar-width: none;

	display: flex;
	justify-content: space-between;
	align-items: start;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	${media.lessThan('xl')`
		& > div {
			margin-right: 10px;
		}
	`}

	p,
	span {
		margin: 0;
		text-align: left;
	}

	.heading,
	.value {
		white-space: nowrap;
	}

	.heading {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	${(props) =>
		props.mobile &&
		css`
			height: auto;
			padding: 15px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-gap: 20px 0;

			.heading {
				margin-bottom: 2px;
			}
		`}
`;

const MarketDropDownContainer = styled.div`
	width: 280px;
	margin-right: 15px;
	@media (min-width: 1200px) {
		display: none;
	}
`;

export default MarketDetails;
