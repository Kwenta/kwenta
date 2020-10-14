import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCol, FlexDivColCentered, Paragraph } from 'styles/common';

import StepOne from 'assets/svg/marketing/step-one.svg';
import StepTwo from 'assets/svg/marketing/step-two.svg';
import StepThree from 'assets/svg/marketing/step-three.svg';

import media from 'styles/media';

import { FlexSection, LeftSubHeader } from '../common';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';

export const STEPS = [
	{
		id: 'step-one',
		image: <img src={StepOne} alt="" />,
		subtitle: 'homepage.steps.one.subtitle',
		title: 'homepage.steps.one.title',
		copy: 'homepage.steps.one.copy',
	},
	{
		id: 'step-two',
		image: <img src={StepTwo} alt="" />,
		subtitle: 'homepage.steps.two.subtitle',
		title: 'homepage.steps.two.title',
		copy: 'homepage.steps.two.copy',
	},
	{
		id: 'step-three',
		image: <img src={StepThree} alt="" />,
		subtitle: 'homepage.steps.three.subtitle',
		title: 'homepage.steps.three.title',
		copy: 'homepage.steps.three.copy',
	},
];

const Steps = () => {
	const { t } = useTranslation();
	const { howItWorksRef } = SmoothScroll.useContainer();

	return (
		<Container>
			<StyledFlexSection ref={howItWorksRef}>
				<StyledLeftSubHeader>{t('homepage.steps.title')}</StyledLeftSubHeader>
				<StepList>
					{STEPS.map(({ id, image, subtitle, title, copy }) => (
						<StepCard key={id}>
							<StepBox>
								<StepIcon>
									{image}
									<StepSubtitle>{t(subtitle)}</StepSubtitle>
								</StepIcon>
							</StepBox>
							<StepTitle>{t(title)}</StepTitle>
							<StepCopy>{t(copy)}</StepCopy>
						</StepCard>
					))}
				</StepList>
			</StyledFlexSection>
		</Container>
	);
};

const Container = styled.div`
	padding-top: 90px;
	${media.lessThan('lg')`
		padding-top: 0;
	`}
`;

const StyledFlexSection = styled(FlexSection)`
	padding-top: 80px;
`;

const StyledLeftSubHeader = styled(LeftSubHeader)`
	${media.lessThan('lg')`
		padding-top: 0;
		padding-bottom: 56px;
	`}
`;

const StepBox = styled.div`
	position: relative;
`;

const StepList = styled(FlexDivColCentered)``;

const StepCard = styled(FlexDivCol)`
	width: 400px;
	margin: 24px 0px;
	${media.lessThan('md')`
		width: unset;
	`}
`;

const StepIcon = styled.div`
	position: relative;
`;

const StepSubtitle = styled(Paragraph)`
	font-size: 16px;
	color: ${(props) => props.theme.colors.goldColors.color1};
	font-family: ${(props) => props.theme.fonts.bold};
	position: absolute;
	bottom: 0;
	margin-bottom: 5px;
`;

const StepTitle = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 32px;
	line-height: 41px;
	color: ${(props) => props.theme.colors.white};
	padding: 20px 0 40px 0;
`;

const StepCopy = styled(Paragraph)`
	font-size: 16px;
	line-height: 24px;
	color: #92969f;
`;

export default Steps;
