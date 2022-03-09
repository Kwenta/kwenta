import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const PortfolioChart: FC = () => {
	const { t } = useTranslation();

	return (
		<Chart />
	);
};

const Chart = styled.div`
	min-width: 915px;
	min-height: 259px;
	border: 1px solid #353333;
	border-radius: 16px;
`

export default PortfolioChart;
