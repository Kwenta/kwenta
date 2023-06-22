import dynamic from 'next/dynamic'

import { ChartProps } from './TVChart'

// @ts-ignore
const TVChartContainer = dynamic<TVChart>(() => import('./TVChart').then((mod) => mod.TVChart), {
	ssr: false,
})

export default (props: ChartProps) => <TVChartContainer {...props} />
