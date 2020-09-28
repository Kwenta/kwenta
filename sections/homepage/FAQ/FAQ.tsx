import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TabButton, TabList, TabPanel } from 'components/Tab';

import media from 'styles/media';

import { StackSection, CenterSubHeader } from '../common';

const FAQ = () => {
	const [activeTab, setActiveTab] = useState('0');
	const { t } = useTranslation();

	return (
		<StyledStackSection id="faq">
			<StyledCenterSubHeader>{t('homepage.faq.title')}</StyledCenterSubHeader>
			<TabList style={{ marginBottom: '12px' }}>
				<StyledTabButton
					name={t('homepage.faq.tabs.one')}
					active={activeTab === '0'}
					onClick={() => setActiveTab('0')}
				>
					{t('homepage.faq.tabs.one')}
				</StyledTabButton>
				<StyledTabButton
					name={t('homepage.faq.tabs.two')}
					active={activeTab === '1'}
					onClick={() => setActiveTab('1')}
				>
					{t('homepage.faq.tabs.two')}
				</StyledTabButton>
				<StyledTabButton
					name={t('homepage.faq.tabs.three')}
					active={activeTab === '2'}
					onClick={() => setActiveTab('2')}
				>
					{t('homepage.faq.tabs.three')}
				</StyledTabButton>
			</TabList>
			<TabPanel name={t('homepage.faq.tabs.one')} activeTab={'0'}>
				<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
			</TabPanel>
			<TabPanel name={t('homepage.faq.tabs.two')} activeTab={'1'}>
				<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
			</TabPanel>
			<TabPanel name={t('homepage.faq.tabs.three')} activeTab={'2'}>
				<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
			</TabPanel>
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

const FAQPanel = styled.div``;

const StyledTabButton = styled(TabButton)`
	background: none;
	color: ${(props) => props.theme.colors.purple};
	padding-bottom: 8px;
	margin: 0px 24px;
	border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.colors.purple}` : 'none')};
	&:hover {
		border-bottom-color: ${(props) => props.theme.colors.white};
	}
`;

export default FAQ;
