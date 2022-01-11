import { CurrencyKey } from '@synthetixio/contracts-interface';
import React from 'react';
import styled from 'styled-components';

type MarketDetailsProps = {
	baseCurrencyKey: CurrencyKey;
};

type MarketData = Record<string, { value: string; color?: string }>;

const MarketDetails: React.FC<MarketDetailsProps> = ({ baseCurrencyKey }) => {
	const data: MarketData = React.useMemo(() => {
		return {
			[`${baseCurrencyKey}/sUSD`]: {
				value: '$12,392.92',
				color: 'green',
			},
			'Live Price': {
				value: '$12,392.92',
			},
			'24H Change': {
				value: '$392.92 (1.8%)',
				color: 'red',
			},
			'24H Volume': {
				value: '$1,392,988.92',
			},
			'24H Trades': {
				value: '22,321',
			},
			'Open Interest': {
				value: '88,278.12 ETH',
			},
			'1H Funding': {
				value: '0.004418%',
				color: 'green',
			},
		};
	}, [baseCurrencyKey]);

	return (
		<MarketDetailsContainer>
			{Object.entries(data).map(([key, { value, color }]) => (
				<div key={key}>
					<p className="heading">{key}</p>
					<p className={color ? `value ${color}` : 'value'}>{value}</p>
				</div>
			))}
		</MarketDetailsContainer>
	);
};

const MarketDetailsContainer = styled.div`
	width: 100%;
	padding: 12px 18px;
	box-sizing: border-box;

	display: flex;
	justify-content: space-between;
	align-items: center;

	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	box-sizing: border-box;

	p {
		margin: 0;
		text-align: left;
	}

	.heading {
		font-size: 12px;
		color: #787878;
	}

	.value {
		margin-top: 4px;
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
		color: #ece8e3;
	}

	.green {
		color: #7fd482;
	}

	.red {
		color: #ef6868;
	}
`;

export default MarketDetails;
