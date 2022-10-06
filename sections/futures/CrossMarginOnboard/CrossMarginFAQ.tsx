import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const CROSS_MARGIN_FAQ_URL = 'https://docs.kwenta.io/products/futures/cross-margin-accounts';

export default function CrossMarginFAQ() {
	const { t } = useTranslation();

	const onClick = () => {
		window.open(CROSS_MARGIN_FAQ_URL);
	};

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
	);
}

const FAQListItem = styled.ul`
	margin: 6px 0;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
`;
