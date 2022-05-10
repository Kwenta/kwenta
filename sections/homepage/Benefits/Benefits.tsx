import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import P2CIcon from 'assets/svg/marketing/icon-p2c.svg';
import PermissionlessIcon from 'assets/svg/marketing/icon-permissionless.svg';
import RestrictionsIcon from 'assets/svg/marketing/icon-restrictions.svg';

import { FlexDivCol } from 'styles/common';

import media from 'styles/media';

import { StackSection, CenterSubHeader, Title, Copy } from '../common';

const BENEFITS = [
	{
		id: 'peer-to-contract',
		image: <P2CIcon />,
		title: 'homepage.benefits.peer-to-contract.title',
		copy: 'homepage.benefits.peer-to-contract.copy',
	},
	{
		id: 'trading-pair',
		image: <RestrictionsIcon />,
		title: 'homepage.benefits.trading-pair.title',
		copy: 'homepage.benefits.trading-pair.copy',
	},
	{
		id: 'permissionless',
		image: <PermissionlessIcon />,
		title: 'homepage.benefits.permissionless.title',
		copy: 'homepage.benefits.permissionless.copy',
	},
];

const Benefits = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<StyledCenterSubHeader>{t('homepage.benefits.title')}</StyledCenterSubHeader>
			<BenefitContainer>
				{BENEFITS.map(({ id, image, title, copy }) => (
					<BenefitCard key={id}>
						{image}
						<StyledTitle>{t(title)}</StyledTitle>
						<Copy>{t(copy)}</Copy>
					</BenefitCard>
				))}
			</BenefitContainer>
		</StackSection>
	);
};

const StyledCenterSubHeader = styled(CenterSubHeader)`
	padding-bottom: 56px;
	max-width: 700px;
	${media.lessThan('lg')`
		max-width: 450px;
	`}
`;

const BenefitCard = styled(FlexDivCol)`
	align-items: flex-start;
	img {
		width: 64px;
		height: 64px;
	}
`;

const StyledTitle = styled(Title)`
	padding-bottom: 14px;
	padding-top: 40px;
`;

const BenefitContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	align-items: baseline;
	margin: 60px 0px 140px 0;
	grid-gap: 40px;
	${media.lessThan('md')`
		margin: 80px 0;
		grid-auto-flow: unset;
		grid-template-columns: repeat(2, 1fr);
	`}
	${media.lessThan('sm')`
		grid-gap: 50px;
		grid-template-columns: auto;
		margin: 56px 0px 80px 0;
	`}
`;

export default Benefits;
