import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import { SYNTHS_MAP } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import { Data, Subtitle } from '../common';

type PerformanceChartProps = {
	changeNumber: number;
	changePercent: number;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ changeNumber, changePercent }) => {
	const { t } = useTranslation();

	return (
		<FlexDivCol>
			<Subtitle>{t('futures.wallet-overview.performance')}</Subtitle>
			<StyledValueRow>
				<StyledData>{formatCurrency(SYNTHS_MAP.sUSD, changeNumber, { sign: '$' })}</StyledData>
				<ChangePercent value={changePercent} />
			</StyledValueRow>
		</FlexDivCol>
	);
};
export default PerformanceChart;

const StyledValueRow = styled(FlexDivRow)`
	justify-content: flex-start;
`;

const StyledData = styled(Data)`
	margin: 16px 0px;
	margin-right: 4px;
`;
