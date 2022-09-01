import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { BorderedPanel } from 'styles/common';
import media from 'styles/media';

type Props = {
	accountType: FuturesAccountType;
	buttons?: {
		onClick: () => any;
		i18nTitle: string;
		Icon?: FunctionComponent<any>;
	}[];
};

export default function TradePanelHeader({ accountType, buttons }: Props) {
	const { t } = useTranslation();
	return (
		<Container>
			<Title>
				{t(
					accountType === 'cross_margin'
						? 'futures.market.trade.cross-margin.title'
						: 'futures.market.trade.isolated-margin.title'
				)}
			</Title>
			<Buttons>
				{buttons &&
					buttons.map(({ Icon, i18nTitle, onClick }) => (
						<HeaderButton
							key={i18nTitle}
							variant="flat"
							size="xs"
							onClick={onClick}
							isRounded
							textColor="yellow"
						>
							<Label>{t(i18nTitle)}</Label>
							{Icon && (
								<IconContainer>
									<Icon />
								</IconContainer>
							)}
						</HeaderButton>
					))}
			</Buttons>
		</Container>
	);
}

const Container = styled(BorderedPanel)`
	display: flex;
	justify-content: space-between;
	padding: 10px 14px;
	margin-bottom: 16px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
`;

const Buttons = styled.div`
	display: flex;
`;

const HeaderButton = styled(Button)`
	margin-left: 10px;
`;

const Label = styled.span`
	${media.lessThan('xl')`
        display: none;
    `}
`;

const IconContainer = styled.span`
	margin-left: 5px;
	${media.lessThan('xl')`
        margin-left: 0;
    `}
`;
