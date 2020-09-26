import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCol, FlexDivColCentered } from 'styles/common';

import StepOne from 'assets/svg/marketing/step-one.svg';
import StepTwo from 'assets/svg/marketing/step-two.svg';
import StepThree from 'assets/svg/marketing/step-three.svg';

import { FlexSection, Col, LeftSubHeader } from '../common';

const STEPS = [
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

	return (
		<FlexSection>
			<Col>
				<LeftSubHeader>{t('homepage.steps.title')}</LeftSubHeader>
			</Col>
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
		</FlexSection>
	);
};

const StepBox = styled.div`
	position: relative;
`;

const StepList = styled(FlexDivColCentered)`
	width: 50%;
`;

const StepCard = styled(FlexDivCol)`
	width: 400px;
	margin: 24px 0px;
`;

const StepIcon = styled.div`
	position: relative;
`;

const StepSubtitle = styled.p`
	font-size: 16px;
	background: linear-gradient(180deg, #f2de82 0%, #d1a866 100%);
	background-clip: text;
	background-size: 100%;
	background-repeat: repeat;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-moz-background-clip: text;
	-moz-text-fill-color: transparent;
	position: absolute;
	bottom: 0;
	margin-bottom: 5px;
`;

const StepTitle = styled.p`
	font-weight: 500;
	font-size: 34px;
	line-height: 41px;
	letter-spacing: -0.03em;
	color: #f7f8fa;
`;

const StepCopy = styled.p`
	font-size: 16px;
	line-height: 24px;
	letter-spacing: -0.005em;
	color: #92969f;
`;

export default Steps;
