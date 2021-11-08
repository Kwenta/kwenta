import dynamic from 'next/dynamic';

const TVChartContainer = dynamic(() => import('./TVChart').then((mod) => mod.TVChart), {
	ssr: false,
});

export default () => <TVChartContainer />;
