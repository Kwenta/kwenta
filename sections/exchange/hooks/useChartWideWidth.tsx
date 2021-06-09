import { useEffect, useState } from 'react';
import { DEFAULT_WIDE_WIDTH } from 'sections/exchange/TradeCard/constants';

const useChartWideWidth = () => {
	const [width, setWidth] = useState(DEFAULT_WIDE_WIDTH);
	useEffect(() => {
		setWidth(window.innerWidth - 100);
	}, []);
	return width;
};

export default useChartWideWidth;
