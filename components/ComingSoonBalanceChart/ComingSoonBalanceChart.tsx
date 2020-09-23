import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';

import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import Card from 'components/Card';

// TODO: implement using real data
import { MOCK_DATA } from './mockData';
import { fonts } from 'styles/theme/fonts';

export const ComingSoonBalanceChart = () => {
	const { t } = useTranslation();

	return (
		<Card>
			<StyledCardBody>
				<StyledResponsiveContainer width="99%" height="100%">
					<AreaChart data={MOCK_DATA}>
						<defs>
							<linearGradient id="synthBalanceChartArea" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#FFF" stopOpacity={0.5} />
								<stop offset="95%" stopColor="#FFF" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="timestamp" hide={true} />
						<YAxis type="number" domain={['auto', 'auto']} hide={true} />
						<Area
							dataKey="rate"
							stroke="#FFF"
							fillOpacity={0.5}
							fill="url(#synthBalanceChartArea)"
							isAnimationActive={false}
						/>
					</AreaChart>
				</StyledResponsiveContainer>
				<Message>{t('common.features.coming-soon')}</Message>
			</StyledCardBody>
		</Card>
	);
};

const StyledCardBody = styled(Card.Body)`
	padding: 0;
	height: 120px;
	position: relative;
`;

const Message = styled.div`
    ${fonts.data.large}
    color: ${(props) => props.theme.colors.white};
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

const StyledResponsiveContainer = styled(RechartsResponsiveContainer)`
	filter: blur(4px);
`;

export default ComingSoonBalanceChart;
