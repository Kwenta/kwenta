import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';

export default function DistributionChart() {
	return (
		<>
			<PieChart width={280} height={280}>
				<Pie data={MOCK_DATA} dataKey={'value'}>
					{MOCK_DATA.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} />
					))}
				</Pie>
			</PieChart>
			<Row>
				{MOCK_DATA.map((i) => (
					<div>
						<LegendBox stroke={i.stroke} background={i.fill} />
						<LegendLabel>{i.name}</LegendLabel>
					</div>
				))}
			</Row>
		</>
	);
}

const Row = styled.div`
	flex-direction: row;
	display: flex;
	justify-content: space-between;
	padding: 0 15px;
`;

const LegendBox = styled.div<{ stroke: string; background: string }>`
	border-width: 1px;
	border-style: solid;
	border-color: ${(props) => props.stroke};
	background-color: ${(props) => props.background};
	width: 20px;
	height: 20px;
	margin: auto;
`;

const LegendLabel = styled.div`
	margin-top: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const MOCK_DATA = [
	{
		name: 'sUSD',
		value: 400,
		fill: '#3D3720',
		stroke: '#675B27',
	},
	{
		name: 'sETH',
		value: 300,
		fill: '#1F3447',
		stroke: '#2E5870',
	},
	{
		name: 'sBTC',
		value: 300,
		fill: '#292944',
		stroke: '#43436B',
	},
	{
		name: 'sLINK',
		value: 200,
		fill: '#1F1F44',
		stroke: '#2E2E6B',
	},
];
