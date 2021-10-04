import React from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer } from 'recharts';
import colors from 'styles/theme/colors';

type ChartDataItem = {
	name: string;
	uv: number;
	pv: number;
};

type Props = {
	data: ChartDataItem[];
};

export default function OpenInterestChart({ data }: Props) {
	return (
		<ResponsiveContainer width="95%" height={300}>
			<BarChart data={data} barGap={6}>
				<CartesianGrid vertical={false} stroke={GRID_STROKE} />
				<defs>
					<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="100%" spreadMethod="reflect">
						<stop offset="0" stopColor="rgba(102, 221, 132, 0.5)" />
						<stop offset="1" stopColor="transparent" />
					</linearGradient>
					<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="100%" spreadMethod="reflect">
						<stop offset="0" stopColor="rgba(203, 54, 109, 0.5)" />
						<stop offset="1" stopColor="transparent" />
					</linearGradient>
				</defs>
				<Bar
					dataKey="pv"
					fill="url(#colorPv)"
					stroke={colors.green}
					radius={[2, 0, 0, 2]}
					barSize={25}
				/>
				<Bar
					dataKey="uv"
					fill="url(#colorUv)"
					stroke={colors.red}
					radius={[2, 0, 0, 2]}
					barSize={25}
				/>
				<XAxis
					stroke={AXIS_STROKE}
					dataKey="name"
					tickLine={false}
					tickMargin={10}
					tick={{ fontSize: 14 }}
				/>
				<YAxis
					stroke={AXIS_STROKE}
					tickLine={false}
					tickMargin={10}
					tickFormatter={(tick) => `${tick}%`}
					tick={{ fontSize: 10 }}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

const AXIS_STROKE = '#6F6E95';
const GRID_STROKE = '#1E1E30';
