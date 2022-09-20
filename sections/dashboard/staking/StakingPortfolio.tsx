import styled from 'styled-components';

import Text from 'components/Text';

import { SplitStakingCard } from './common';

type PortfolioItemIndividual = {
	title: string;
	value: string;
};

type PortfolioItem = [PortfolioItemIndividual, PortfolioItemIndividual];

const DEFAULT_CARDS: PortfolioItem[] = [
	[
		{
			title: 'Liquid',
			value: '2923.39',
		},
		{
			title: 'Escrow',
			value: '2923.39',
		},
	],
	[
		{
			title: 'Staked',
			value: '2923.39',
		},
		{
			title: 'Staked Escrow',
			value: '2923.39',
		},
	],
	[
		{
			title: 'Claimable',
			value: '23.22',
		},
		{
			title: 'Vestable',
			value: '23.22',
		},
	],
];

const StakingPortfolio = () => {
	return (
		<div>
			<Header variant="h4">Portfolio</Header>
			<CardsContainer>
				{DEFAULT_CARDS.map((card) => (
					<SplitStakingCard>
						{card.map(({ title, value }) => (
							<div>
								<div>
									<div className="title">{title}</div>
									<div className="value">{value}</div>
								</div>
							</div>
						))}
					</SplitStakingCard>
				))}
			</CardsContainer>
		</div>
	);
};

const Header = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	margin-bottom: 15px;
`;

const CardsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(3, minmax(334px, 1fr));
	grid-gap: 15px;
	margin-bottom: 100px;
`;

export default StakingPortfolio;
