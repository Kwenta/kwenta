import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { BorderedPanel } from 'styles/common';

export default function CrossMarginUnsupported() {
	const { t } = useTranslation();

	return (
		<MessageContainer>
			<Title data-testid="cross-margin-unsupported-network">
				{t('futures.market.trade.cross-margin.title')}
			</Title>
			<UnsupportedMessage>{t('futures.market.trade.cross-margin.unsupported')} </UnsupportedMessage>
			<IsolatedLink>
				<Link href={ROUTES.Markets.Home('isolated_margin')}>
					{t('futures.market.trade.cross-margin.switch-type')}
				</Link>
			</IsolatedLink>
		</MessageContainer>
	);
}

const UnsupportedMessage = styled.div`
	margin-top: 12px;
`;

const IsolatedLink = styled.div`
	margin-top: 12px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const MessageContainer = styled(BorderedPanel)`
	text-align: center;
	padding: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;
