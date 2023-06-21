import React, { useCallback } from 'react';

import TextToggle from 'components/TextToggle';
import { setSelectedChart } from 'state/futures/reducer';
import { useAppSelector, useAppDispatch } from 'state/hooks';

const CHART_OPTIONS: ('price' | 'funding')[] = ['price', 'funding'];

const ChartToggle = () => {
	const dispatch = useAppDispatch();
	const selectedChart = useAppSelector(({ futures }) => futures.selectedChart);

	const handleChartChange = useCallback(
		(chart: 'price' | 'funding') => {
			dispatch(setSelectedChart(chart));
		},
		[dispatch]
	);

	return (
		<TextToggle
			title="Chart"
			options={CHART_OPTIONS}
			selectedOption={selectedChart}
			onOptionChange={handleChartChange}
		/>
	);
};

export default ChartToggle;
