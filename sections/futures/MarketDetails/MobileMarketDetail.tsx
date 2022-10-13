import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { marketInfoState } from 'store/futures';
import { formatDollars, formatPercent } from 'utils/formatters/number';

const MobileMarketDetail: React.FC = () => {
	const marketInfo = useRecoilValue(marketInfoState);
	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';

	const longSkewText = useMemo(() => {
		return (
			marketInfo?.openInterest &&
			formatDollars(marketInfo.openInterest.longUSD, {
				maxDecimals: 2,
				...(marketInfo?.openInterest?.longUSD.gt(1e6)
					? { truncation: { divisor: 1e6, unit: 'M' } }
					: {}),
			})
		);
	}, [marketInfo]);

	const shortSkewText = useMemo(() => {
		return (
			marketInfo?.openInterest &&
			formatDollars(marketInfo.openInterest.shortUSD, {
				maxDecimals: 2,
				...(marketInfo?.openInterest?.shortUSD.gt(1e6)
					? { truncation: { divisor: 1e6, unit: 'M' } }
					: {}),
			})
		);
	}, [marketInfo]);

	return (
		<div key="Skew">
			<p className="heading">Skew</p>
			<SkewDataContainer>
				<div className={`value green ${pausedClass}`}>
					{marketInfo?.openInterest &&
						formatPercent(marketInfo.openInterest.longPct ?? 0, { minDecimals: 0 })}{' '}
					({longSkewText})
				</div>
				<div className={`value red ${pausedClass}`}>
					{marketInfo?.openInterest &&
						formatPercent(marketInfo.openInterest.shortPct ?? 0, { minDecimals: 0 })}{' '}
					({shortSkewText})
				</div>
			</SkewDataContainer>
		</div>
	);
};

export default MobileMarketDetail;

const SkewDataContainer = styled.div`
	grid-row: 1;
`;
