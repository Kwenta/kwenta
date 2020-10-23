import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel } from '@reach/accordion';

import { EXTERNAL_LINKS } from 'constants/links';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';

import PlusThinIcon from 'assets/inline-svg/app/plus-thin.svg';
import LinkIcon from 'assets/inline-svg/app/link.svg';

import media from 'styles/media';

import { StackSection, CenterSubHeader } from '../common';
import { ExternalLink, resetButtonCSS } from 'styles/common';

type Item = {
	question: string;
	answer: string;
	link?: string;
};

const FAQ = () => {
	const { t } = useTranslation();
	const { faqRef } = SmoothScroll.useContainer();

	const tabs = useMemo(
		() => [
			{
				title: t('homepage.faq.tabs.trading-on-kwenta.title'),
				items: [
					{
						question: t('homepage.faq.tabs.trading-on-kwenta.items.qna1.question'),
						answer: t('homepage.faq.tabs.trading-on-kwenta.items.qna1.answer'),
					},
					{
						question: t('homepage.faq.tabs.trading-on-kwenta.items.qna2.question'),
						answer: (
							<Trans
								t={t}
								i18nKey="homepage.faq.tabs.trading-on-kwenta.items.qna2.answer"
								components={[<ExternalLink href={EXTERNAL_LINKS.Synthetix.Litepaper} />]}
							/>
						),
					},
					{
						question: t('homepage.faq.tabs.trading-on-kwenta.items.qna3.question'),
						answer: t('homepage.faq.tabs.trading-on-kwenta.items.qna3.answer'),
					},
				],
			},
			{
				title: t('homepage.faq.tabs.getting-started.title'),
				items: [
					{
						question: t('homepage.faq.tabs.getting-started.items.qna1.question'),
						answer: t('homepage.faq.tabs.getting-started.items.qna1.answer'),
						link: 'https://www.youtube.com/watch?v=TDGq4aeevgY',
					},
					{
						question: t('homepage.faq.tabs.getting-started.items.qna2.question'),
						answer: t('homepage.faq.tabs.getting-started.items.qna2.answer'),
						link: 'https://www.youtube.com/watch?v=k9HYC0EJU6E',
					},
					{
						question: t('homepage.faq.tabs.getting-started.items.qna3.question'),
						answer: t('homepage.faq.tabs.getting-started.items.qna3.answer'),
					},
				],
			},
		],
		[t]
	) as Array<{ title: string; items: Item[] }>;

	return (
		<Container>
			<StyledStackSection ref={faqRef}>
				<StyledCenterSubHeader>{t('homepage.faq.title')}</StyledCenterSubHeader>
				<StyledTabs>
					<TabList>
						{tabs.map(({ title }) => (
							<Tab key={title}>{title}</Tab>
						))}
					</TabList>
					<TabPanels>
						{tabs.map(({ title, items }) => (
							<TabPanel key={title}>
								<StyledAccordion collapsible={true} multiple={true}>
									{items.map(({ question, answer, link }) => (
										<AccordionItem key={question}>
											<AccordionButton>
												{question}
												<AccordionOpenIcon src={PlusThinIcon} />
												<AccordionCloseIcon src={PlusThinIcon} />
											</AccordionButton>
											<AccordionPanel>
												{answer}
												{link && (
													<ExplainerVideoLink>
														<ExternalLink href={link}>
															{t('homepage.faq.tabs.explainer-video')} <Svg src={LinkIcon} />
														</ExternalLink>
													</ExplainerVideoLink>
												)}
											</AccordionPanel>
										</AccordionItem>
									))}
								</StyledAccordion>
							</TabPanel>
						))}
					</TabPanels>
				</StyledTabs>
			</StyledStackSection>
		</Container>
	);
};

const Container = styled.div`
	padding-top: 140px;
	${media.lessThan('lg')`
		padding-top: 80px;
	`}
`;

const StyledStackSection = styled(StackSection)`
	padding-top: 80px;
`;

const StyledCenterSubHeader = styled(CenterSubHeader)`
	padding-bottom: 64px;
	${media.lessThan('lg')`
		padding-bottom: 53px;
	`}
	${media.lessThan('md')`
		padding-bottom: 36px;
	`}
`;

const AccordionIconMixin = `
	flex-shrink: 0;
	margin-left: 40px;
`;

const AccordionOpenIcon = styled(Svg)`
	${AccordionIconMixin};
`;

const AccordionCloseIcon = styled(Svg)`
	transform: rotate(45deg);
	${AccordionIconMixin};
`;

const StyledTabs = styled(Tabs)`
	width: 100%;
	[data-reach-tab-list] {
		outline: none;
		justify-content: center;
		background: none;
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 14px;
		margin-bottom: 40px;
	}
	[data-reach-tab] {
		outline: none;
		white-space: nowrap;
		text-transform: uppercase;
		padding: 0;
		padding-bottom: 4px;
		margin: 0 16px;
		border-width: 2px;
		color: ${(props) => props.theme.colors.goldColors.color1};
		&:hover {
			color: ${(props) => props.theme.colors.goldColors.color3};
		}
		&[data-selected] {
			color: ${(props) => props.theme.colors.goldColors.color3};
		}
	}
	[data-reach-tab-panel] {
		outline: none;
		a {
			color: ${(props) => props.theme.colors.goldColors.color1};
			&:hover {
				color: ${(props) => props.theme.colors.goldColors.color3};
			}
		}
	}
`;

const StyledAccordion = styled(Accordion)`
	outline: none;
	[data-reach-accordion-item] {
		padding: 24px 0;
		border-bottom: 1px solid ${(props) => props.theme.colors.goldColors.color1};
	}
	[data-reach-accordion-button] {
		${resetButtonCSS};
		color: ${(props) => props.theme.colors.white};
		font-size: 32px;
		width: 100%;
		text-align: left;
		display: flex;
		align-items: center;
		justify-content: space-between;
		${AccordionCloseIcon} {
			display: none;
		}
		${media.lessThan('md')`
			font-size: 20px;
		`}
	}
	[data-reach-accordion-panel] {
		color: ${(props) => props.theme.colors.white};
		font-size: 16px;
		line-height: 22px;
		padding-top: 8px;
		outline: none;
		padding-right: 40px;
	}
	[data-state='open'] {
		[data-reach-accordion-button] {
			${AccordionOpenIcon} {
				display: none;
			}
			${AccordionCloseIcon} {
				display: unset;
			}
		}
	}
`;

const ExplainerVideoLink = styled.div`
	padding-top: 15px;
	a {
		display: flex;
		align-items: center;
		svg {
			margin-left: 10px;
		}
	}
`;

export default FAQ;
