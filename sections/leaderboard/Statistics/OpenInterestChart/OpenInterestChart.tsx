import Loader from 'components/Loader';
import useGetFuturesOpenInterest from 'queries/futures/useGetFuturesOpenInterest';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer } from 'recharts';

import colors from 'styles/theme/colors';

type Props = {
	currencyKeys: string[];
};

export default function OpenInterestChart({ currencyKeys }: Props) {
	const { t } = useTranslation();
	const openInterestQuery = useGetFuturesOpenInterest(currencyKeys);
	const data =
		openInterestQuery.data?.map((i) => {
			return {
				name: i.asset,
				uv: i.ratio.short * 100,
				pv: i.ratio.long * 100,
			};
		}) ?? [];

	if (openInterestQuery.isLoading || openInterestQuery.isIdle) {
		return <Loader inline />;
	} else if (openInterestQuery.error) {
		return <div>{t('leaderboard.statistics.failed-loading')}</div>;
	} else if (!data.length) {
		return <div>{t('leaderboard.statistics.empty-results')}</div>;
	}

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
