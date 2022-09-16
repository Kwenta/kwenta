import React from 'react';
import styled from 'styled-components';

import Text from 'components/Text';

const StakingPortfolio = () => {
	return (
		<div>
			<Header variant="h4">Portfolio</Header>
		</div>
	);
};

const Header = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.text.title};
	margin-bottom: 8px;
`;

export default StakingPortfolio;
