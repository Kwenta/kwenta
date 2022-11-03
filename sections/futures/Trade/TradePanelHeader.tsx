import Wei from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import SwitchAssetArrows from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { NumberDiv } from 'components/Text/NumberLabel';
import { EXTERNAL_LINKS } from 'constants/links';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { BorderedPanel, TextButton, YellowIconButton } from 'styles/common';
import { formatDollars } from 'utils/formatters/number';

type Props = {
	accountType: FuturesAccountType;
	balance: Wei;
	onManageBalance: () => void;
};

export default function TradePanelHeader({ accountType, onManageBalance, balance }: Props) {
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
			<BalanceRow onClick={onManageBalance}>
				<NumberDiv contrast="strong">{formatDollars(balance)}</NumberDiv>
				<BalanceButton>
					<SwitchAssetArrows />
				</BalanceButton>
			</BalanceRow>
		</Container>
	);
}

const Container = styled(BorderedPanel)`
	display: flex;
	justify-content: space-between;
	padding: 10px 12px;
	margin-bottom: 16px;
	height: 55px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	align-items: center;
	cursor: default;
`;

const StyledFuturesIcon = styled(FuturesIcon)`
	margin-right: 6px;
`;

const BalanceRow = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const BalanceButton = styled(YellowIconButton)`
	display: flex;
	gap: 8px;
	align-items: center;
	&:hover {
		opacity: 0.7;
	}
`;

const FAQLink = styled.div`
	&:hover {
		opacity: 0.5;
	}
	cursor: pointer;
	margin-left: 5px;
`;
