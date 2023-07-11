import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { EXTERNAL_LINKS } from 'constants/links'

export default function CrossMarginFAQ() {
	const { t } = useTranslation()

	const onClick = () => {
		window.open(EXTERNAL_LINKS.Docs.CrossMarginFaq)
	}

	return (
		<ul>
			<FAQListItem onClick={onClick}>
				<div>{t('futures.modals.onboard.faq1')}</div>
				<div>↗</div>
			</FAQListItem>
			<FAQListItem onClick={onClick}>
				<div>{t('futures.modals.onboard.faq2')}</div>
				<div>↗</div>
			</FAQListItem>
			<FAQListItem onClick={onClick}>
				<div>{t('futures.modals.onboard.faq3')}</div>
				<div>↗</div>
			</FAQListItem>
		</ul>
	)
}

const FAQListItem = styled.ul`
	margin-bottom: 6px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
	&:last-child {
		margin-bottom: 0;
	}
	&:first-child {
		margin-top: 6px;
	}
`
