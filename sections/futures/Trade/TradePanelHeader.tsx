import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import Button from 'components/Button';
import { ButtonVariant } from 'components/Button/Button';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { EXTERNAL_LINKS } from 'constants/links';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { BorderedPanel } from 'styles/common';
import media from 'styles/media';

type Props = {
	accountType: FuturesAccountType;
	buttons?: {
		onClick: (() => void) | undefined;
		variant?: ButtonVariant;
		i18nTitle: string;
		icon?: ReactNode;
	}[];
};

export default function TradePanelHeader({ accountType, buttons }: Props) {
	const { t } = useTranslation();

	return (
		<Container>
			<Title>
				<StyledFuturesIcon type={accountType} />
				{t(
					accountType === 'cross_margin'
						? 'futures.market.trade.cross-margin.title'
						: 'futures.market.trade.isolated-margin.title'
				)}
				{accountType === 'cross_margin' && (
					<FAQLink onClick={() => window.open(EXTERNAL_LINKS.Docs.CrossMarginFaq)}>
						<HelpIcon />
					</FAQLink>
				)}
			</Title>
			<Buttons>
				{buttons &&
					buttons.map(({ icon, i18nTitle, variant, onClick }) => (
						<HeaderButton
							key={i18nTitle}
							variant={variant || 'flat'}
							size="xs"
							onClick={onClick}
							isRounded
							textColor="yellow"
						>
							<Label>{t(i18nTitle)}</Label>
							{icon && <IconContainer>{icon}</IconContainer>}
						</HeaderButton>
					))}
			</Buttons>
		</Container>
	);
}

const StyledFuturesIcon = styled(FuturesIcon)`
	margin-right: 6px;
`;

const Container = styled(BorderedPanel)`
	display: flex;
	justify-content: space-between;
	padding: 10px 10px;
	margin-bottom: 16px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	align-items: center;
	cursor: default;
`;

const FAQLink = styled.div`
	&:hover {
		opacity: 0.5;
	}
	cursor: pointer;
	margin-left: 5px;
`;

const Buttons = styled.div`
	display: flex;
`;

const HeaderButton = styled(Button)`
	margin-left: 10px;
`;

const Label = styled.span`
	@media (max-width: 1550px) {
		display: none;
	}
`;

const IconContainer = styled.span`
	margin-left: 5px;

	@media (max-width: 1550px) {
		margin-left: 0;
	}
`;
