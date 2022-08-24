import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { BorderedPanel } from 'styles/common';

type Props = {
	accountType: FuturesAccountType;
	button?: {
		onClick: () => any;
		i18nTitle: string;
	};
};

export default function TradePanelHeader({ accountType, button }: Props) {
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
			{button && (
				<Button variant="flat" size="xs" onClick={button.onClick} isRounded textColor="yellow">
					{t(button.i18nTitle)}
				</Button>
			)}
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
