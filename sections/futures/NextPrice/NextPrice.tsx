import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CurrencyKey } from 'constants/currency';
import useGetFuturesPastTrades from 'queries/futures/useGetFuturesPastTrades';

const NextPrice: React.FC = () => {
	const router = useRouter();
	const marketAsset = (router.query.market?.[0] as CurrencyKey) ?? null;
	const futuresPastTradesQuery = useGetFuturesPastTrades(marketAsset);
	const pastTrades = futuresPastTradesQuery?.data ?? [];

	return (
		<NextPriceContainer>
			<SkewContainer></SkewContainer>
			<TradeHistoryContainer>
				<TradeHistoryTitle>
					<p>Trade history</p>
					<p>
						<span>Last 50 trades</span>
					</p>
				</TradeHistoryTitle>
				<TradeHistoryHeading></TradeHistoryHeading>
				<TradeHistoryBody>
					{pastTrades.map((t) => {
						return (
							<div key={t.id}>
								<p>{t.size}</p>
								<p>{t.price}</p>
								<p>{t.timestamp}</p>
							</div>
						);
					})}
				</TradeHistoryBody>
			</TradeHistoryContainer>
		</NextPriceContainer>
	);
};

const SkewContainer = styled.div`
	box-sizing: border-box;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	height: 55px;
	padding: 13px 18px;
	margin-bottom: 16px;
`;

const NextPriceContainer = styled.div`
	width: 326px;
`;

const TradeHistoryContainer = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
`;

const TradeHistoryTitle = styled.div`
	box-sizing: border-box;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 18px 15px;
	display: flex;
	justify-content: space-between;

	p {
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		margin: 0;
	}

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const TradeHistoryHeading = styled.div``;

const TradeHistoryBody = styled.div`
	div {
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		padding: 10px 15px;
		font-size: 11px;

		p {
			margin: 0;
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}

		&:not(:last-of-type) {
			border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
		}
	}
`;

export default NextPrice;
