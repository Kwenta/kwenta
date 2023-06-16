import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SplitContainer } from 'components/layout/grid';
import { Heading, Description } from 'sections/earn/text';

import EarnStakeCard from './EarnStakeCard';
import StakeGrid from './StakeGrid';

const StepOne = () => {
	const { t } = useTranslation();

	return (
		<StepOneContainer>
			<Heading>{t('dashboard.earn.unstake-token.title')}</Heading>
			<Description>{t('dashboard.earn.unstake-token.copy')}</Description>
			<SplitContainer>
				<EarnStakeCard />
				<StakeGrid />
			</SplitContainer>
		</StepOneContainer>
	);
};

const StepOneContainer = styled.div`
	margin-top: 50px;
`;

export default StepOne;
