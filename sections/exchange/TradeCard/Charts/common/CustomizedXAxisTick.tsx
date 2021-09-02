import React from 'react';
import formatDate from 'date-fns/format';
import { isNumber } from 'lodash';

import { PERIOD_IN_HOURS } from 'constants/period';

const CustomizedXAxisTick = (props: any) => {
	const { selectedChartPeriodLabel, x, y, payload } = props;
	const { value } = payload;

	if (!isNumber(value)) {
		return <div />;
	}

	const isPeriodOverOneDay =
		selectedChartPeriodLabel != null && selectedChartPeriodLabel.value > PERIOD_IN_HOURS.ONE_DAY;

	const textValue = isPeriodOverOneDay ? formatDate(value, 'dd MMM') : formatDate(value, 'h:mma');

	return (
		<g transform={`translate(${x},${y})`}>
			<text x={0} y={0} textAnchor="end" fill="#666" transform="rotate(-35)">
				{textValue}
			</text>
		</g>
	);
};

export default CustomizedXAxisTick;
