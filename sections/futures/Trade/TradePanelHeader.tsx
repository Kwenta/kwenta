import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { BorderedPanel } from 'styles/common';

type Props = {
	accountType: FuturesAccountType;
	buttons?: {
		onClick: () => any;
		i18nTitle: string;
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
					buttons.map((b) => (
						<HeaderButton
							key={b.i18nTitle}
							variant="flat"
							size="xs"
							onClick={b.onClick}
							isRounded
							textColor="yellow"
						>
							{t(b.i18nTitle)}
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
	font-size: 17px;
`;

const Buttons = styled.div`
	display: flex;
`;

const HeaderButton = styled(Button)`
	margin-left: 10px;
`;
