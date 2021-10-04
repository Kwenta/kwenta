import React from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer } from 'recharts';

export default function OpenInterestChart() {
	return (
		<ResponsiveContainer width="95%" height={300}>
			<BarChart data={MOCK_DATA}>
				<CartesianGrid vertical={false} stroke="#1E1E30" />
				<defs>
					<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="100%" spreadMethod="reflect">
						<stop offset="0" stopColor="#3B7651" />
						<stop offset="1" stopColor="transparent" />
					</linearGradient>
					<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="100%" spreadMethod="reflect">
						<stop offset="0" stopColor="#6D2345" />
						<stop offset="1" stopColor="transparent" />
					</linearGradient>
				</defs>
				<Bar
					dataKey="pv"
					fill="url(#colorPv)"
					stroke="#66DD84"
					radius={[2, 0, 0, 2]}
					barSize={25}
				/>
				<Bar
					dataKey="uv"
					fill="url(#colorUv)"
					stroke="#CB366D"
					radius={[2, 0, 0, 2]}
					barSize={25}
				/>
				<XAxis stroke="#6F6E95" dataKey="name" tickLine={false} tickMargin={10} />
				<YAxis
					stroke="#6F6E95"
					tickLine={false}
					tickMargin={10}
					tickFormatter={(tick) => {
						return `${tick}%`;
					}}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

const MOCK_DATA = [
	{
		name: 'sBTC',
		uv: 35,
		pv: 65,
	},
	{
		name: 'sETH',
		uv: 60,
		pv: 40,
	},
	{
		name: 'sLINK',
		uv: 55,
		pv: 65,
	},
];
