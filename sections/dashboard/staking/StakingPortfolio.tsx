import styled from 'styled-components';

import Text from 'components/Text';

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
					<PortfolioCard>
						{card.map(({ title, value }) => (
							<div>
								<div>
									<div className="title">{title}</div>
									<div className="value">{value}</div>
								</div>
							</div>
						))}
					</PortfolioCard>
				))}
			</CardsContainer>
		</div>
	);
};

const PortfolioCard = styled.div`
	display: flex;
	background: linear-gradient(0deg, #181818, #181818),
		linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 15px;

	& > div {
		flex: 1;
		padding: 30px 0;
		display: flex;
		flex-direction: column;
		align-items: center;

		&:first-of-type {
			border-right: ${(props) => props.theme.colors.selectedTheme.border};
		}
	}

	.title {
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
		font-size: 15px;
	}

	.value {
		margin-top: 10px;
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
		font-family: ${(props) => props.theme.fonts.monoBold};
		font-size: 26px;
		align-self: center;
	}
`;

const Header = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.text.title};
	margin-bottom: 8px;
`;

const CardsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(3, minmax(334px, 1fr));
	grid-gap: 15px;
	margin-bottom: 100px;
`;

export default StakingPortfolio;
