import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel } from '@reach/accordion';

import PlusThinIcon from 'assets/inline-svg/app/plus-thin.svg';

import media from 'styles/media';

import { StackSection, CenterSubHeader } from '../common';
import { resetButtonCSS } from 'styles/common';

type Item = {
	question: string;
	answer: string;
};

const FAQ = () => {
	const { t } = useTranslation();

	const tabs = t('homepage.faq.tabs', {
		returnObjects: true,
	}) as Array<{ title: string; items: Item[] }>;

	return (
		<StyledStackSection id="faq">
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
								{items.map(({ question, answer }) => (
									<AccordionItem key={question}>
										<AccordionButton>
											{question}
											<AccordionOpenIcon />
											<AccordionCloseIcon />
										</AccordionButton>
										<AccordionPanel>{answer}</AccordionPanel>
									</AccordionItem>
								))}
							</StyledAccordion>
						</TabPanel>
					))}
				</TabPanels>
			</StyledTabs>
		</StyledStackSection>
	);
};

const StyledStackSection = styled(StackSection)`
	padding-top: 220px;
	${media.lessThan('lg')`
		padding-top: 160px;
	`}
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

// @ts-ignore
const AccordionOpenIcon = styled(PlusThinIcon)`
	flex-shrink: 0;
`;

// @ts-ignore
const AccordionCloseIcon = styled(PlusThinIcon)`
	transform: rotate(45deg);
	flex-shrink: 0;
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
		color: ${(props) => props.theme.colors.purple};
		&:hover {
			color: ${(props) => props.theme.colors.purpleHover};
		}
		&[data-selected] {
			color: ${(props) => props.theme.colors.purpleHover};
		}
	}
	[data-reach-tab-panel] {
		outline: none;
	}
`;

const StyledAccordion = styled(Accordion)`
	outline: none;
	[data-reach-accordion-item] {
		padding: 24px 0;
		border-bottom: 1px solid ${(props) => props.theme.colors.purple};
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
		${media.lessThan('sm')`
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

export default FAQ;
