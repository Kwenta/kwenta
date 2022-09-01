import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CrossMarginIcon from 'assets/svg/futures/cross-margin-icon.svg';
import Button from 'components/Button';
import { BorderedPanel } from 'styles/common';

import CrossMarginFAQ from '../CrossMarginOnboard/CrossMarginFAQ';

type Props = {
	onShowOnboard: () => void;
};

export default function CreateAccount({ onShowOnboard }: Props) {
	const { t } = useTranslation();

	return (
		<>
			<CreateAccountContainer>
				<Title>{t('futures.market.trade.cross-margin.title')}</Title>
				<CreateAccountButton variant="flat" onClick={onShowOnboard}>
					{t('futures.market.trade.cross-margin.create-account')}
				</CreateAccountButton>
			</CreateAccountContainer>
			<FAQContainer>
				<CrossMarginIcon height="21px" width="30px" />
				<Title yellow>{t('futures.market.trade.cross-margin.faq-title')}</Title>
				<Questions>
					<CrossMarginFAQ />
				</Questions>
			</FAQContainer>
		</>
	);
}

const CreateAccountContainer = styled(BorderedPanel)`
	color: white;
	padding: 50px 30px;
	text-align: center;
`;

const FAQContainer = styled(BorderedPanel)`
	color: white;
	padding: 30px;
	margin-top: 20px;
`;

const Title = styled.div<{ yellow?: boolean }>`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) =>
		props.yellow
			? props.theme.colors.selectedTheme.yellow
			: props.theme.colors.selectedTheme.button.text.primary};
`;

const CreateAccountButton = styled(Button)`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	font-size: 12px;
	padding: 8px 11px;
	width: 120px;
	margin-top: 14px;
	border-radius: 30px;
`;

const Questions = styled.div`
	margin-top: 10px;
	border-top: ${(props) => `${props.theme.colors.selectedTheme.border}`};
`;
