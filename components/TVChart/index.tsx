import dynamic from 'next/dynamic';

// @ts-ignore
const TVChartContainer = dynamic(() => import('./TVChart').then((mod) => mod.TVChart), {
	ssr: false,
});

export default (props: any) => <TVChartContainer {...props} />;
