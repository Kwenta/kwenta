import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import FeatureCardDotPoint from 'assets/inline-svg/marketing/feature-card-dot.svg';

import { FlexDivCentered, FlexDivCol } from 'styles/common';

import { Col, Copy, FlexSection, GridContainer, LeftSubHeader, Title } from '../common';

const FEATURES = [
	{
		id: 'order-types',
		title: 'homepage.features.order-types.title',
		copy: 'homepage.features.order-types.copy',
	},
	{
		id: 'options-futures',
		title: 'homepage.features.options-futures.title',
		copy: 'homepage.features.options-futures.copy',
	},
	{
		id: 'leverage',
		title: 'homepage.features.leverage.title',
		copy: 'homepage.features.leverage.copy',
		comingSoon: true,
	},
	{
		id: 'options-futures2',
		title: 'homepage.features.options-futures.title',
		copy: 'homepage.features.options-futures.copy',
	},
];

const Features = () => {
	const { t } = useTranslation();

	return (
		<FlexSection>
			<Col>
				<LeftSubHeader>{t('homepage.features.title')}</LeftSubHeader>
			</Col>
			<Col>
				<GridContainer>
					{FEATURES.map(({ id, title, comingSoon, copy }) => (
						<FeatureCard key={id}>
							<FeatureCardDotPoint />
							<FlexDivCentered>
								<Title>{t(title)}</Title>
								{comingSoon && <ComingSoonTag>COMING SOON</ComingSoonTag>}
							</FlexDivCentered>
							<Copy>{t(copy)}</Copy>
						</FeatureCard>
					))}
				</GridContainer>
			</Col>
		</FlexSection>
	);
};

const FeatureCard = styled(FlexDivCol)`
	margin-bottom: 16px;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 128px;
	height: 24px;
	background: ${(props) => props.theme.colors.purple};
	border-radius: 50px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin-left: 8px;
`;

export default Features;
