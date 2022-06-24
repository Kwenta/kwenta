import React from 'react';
import styled from 'styled-components';
import { SectionHeader } from 'sections/futures/MobileTrade/common';

const Portfolio: React.FC = () => {
	return (
		<div>
			<div style={{ margin: 15 }}>
				<SectionHeader>Portfolio</SectionHeader>
			</div>
			<ChartPlaceholder />
		</div>
	);
};

const ChartPlaceholder = styled.div`
	height: 273px;
`;

export default Portfolio;
