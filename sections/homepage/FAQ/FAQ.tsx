import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TabButton, TabList, TabPanel } from 'components/Tab';

import { StackSection, CenterSubHeader } from '../common';

const FAQ = () => {
	const [activeTab, setActiveTab] = useState('0');
	const { t } = useTranslation();

	return (
		<StackSection id="faq">
			<CenterSubHeader>{t('homepage.faq.title')}</CenterSubHeader>
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
		</StackSection>
	);
};

const FAQPanel = styled.div``;

const StyledTabButton = styled(TabButton)`
	background: linear-gradient(180deg, #f2de82 0%, #d1a866 100%);
	background-clip: text;
	background-size: 100%;
	background-repeat: repeat;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-moz-background-clip: text;
	-moz-text-fill-color: transparent;
	padding-bottom: 8px;
	margin: 0px 24px;
	border-bottom: ${(props) => (props.active ? `2px solid #f2de82` : 'none')};
`;

export default FAQ;
