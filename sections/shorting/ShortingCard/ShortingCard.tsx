import { FC } from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import { useTranslation, Trans } from 'react-i18next';

import { MessageContainer, Message, MessageButton } from '../common';
import Link from 'next/link';

const ShortingCard: FC = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<MessageContainer>
				<Message>
					<Trans t={t} i18nKey="shorting.deprecated" />
				</Message>
				<Link href="https://v2.beta.kwenta.io/">
					<MessageButton size="lg" variant="primary" isRounded={true}>
						{t('shorting.visit-futures')}
					</MessageButton>
				</Link>
			</MessageContainer>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	margin-bottom: 30px;
	${media.lessThan('md')`
		// TODO: this is needed to cancel the content "push" that comes content from "TradeSummaryCard" (on tablet/mobile)
		margin-bottom: -50px;
	`}
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export default ShortingCard;
