import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CrossMarginIconDark from 'assets/svg/futures/cross-margin-icon-dark.svg';
import CrossMarginIconLight from 'assets/svg/futures/cross-margin-icon-light.svg';
import Button from 'components/Button';
import { setShowCrossMarginOnboard } from 'state/futures/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';
import { BorderedPanel } from 'styles/common';

import CrossMarginFAQ from '../CrossMarginOnboard/CrossMarginFAQ';

export default function CreateAccount() {
	const { t } = useTranslation();
	const currentTheme = useAppSelector(selectCurrentTheme);
	const dispatch = useAppDispatch();

	const Icon = currentTheme === 'dark' ? CrossMarginIconDark : CrossMarginIconLight;

	const onShowOnboard = () => dispatch(setShowCrossMarginOnboard(true));

	return (
		<div>
			<CreateAccountContainer data-testid="cross-margin-create-account">
				<Title>{t('futures.market.trade.cross-margin.title')}</Title>
				<CreateAccountButton variant="flat" onClick={onShowOnboard}>
					{t('futures.market.trade.cross-margin.create-account')}
				</CreateAccountButton>
			</CreateAccountContainer>
			<FAQContainer>
				<Icon height="21px" width="30px" />
				<FaqTitle yellow>{t('futures.market.trade.cross-margin.faq-title')}</FaqTitle>
				<Questions>
					<CrossMarginFAQ />
				</Questions>
			</FAQContainer>
		</div>
	);
}

const CreateAccountContainer = styled(BorderedPanel)`
	color: white;
	padding: 50px 30px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const FAQContainer = styled(BorderedPanel)`
	color: white;
	padding: 15px;
	margin-top: 15px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const FaqTitle = styled.span<{ yellow?: boolean }>`
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
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`;
