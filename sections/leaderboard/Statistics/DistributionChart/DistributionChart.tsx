import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';

type ChartDataItem = {
	name: string;
	value: number;
};

type Props = {
	data: ChartDataItem[];
};

export default function DistributionChart({ data }: Props) {
	return (
		<>
			<PieChart width={280} height={280}>
				<Pie data={data} dataKey={'value'}>
					{data.map((item, index) => (
						<Cell
							key={`cell-${index}`}
							fill={fillColor(item.name)}
							stroke={strokeColor(item.name)}
						/>
					))}
				</Pie>
			</PieChart>
			<Row>
				{data.map((i) => (
					<div>
						<LegendBox stroke={strokeColor(i.name)} background={fillColor(i.name)} />
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

const strokeColor = (asset: string) => {
	switch (asset) {
		case 'sUSD':
			return '#675B27';
		case 'sETH':
			return '#2E5870';
		case 'sBTC':
			return '#43436B';
		case 'sLINK':
			return '#2E2E6B';
		default:
			return '#675B27';
	}
};

const fillColor = (asset: string) => {
	switch (asset) {
		case 'sUSD':
			return '#3D3720';
		case 'sETH':
			return '#1F3447';
		case 'sBTC':
			return '#292944';
		case 'sLINK':
			return '#1F1F44';
		default:
			return '#3D3720';
	}
};
