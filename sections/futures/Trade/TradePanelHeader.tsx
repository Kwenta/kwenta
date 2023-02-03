import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import SwitchAssetArrows from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import Button from 'components/Button';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { NumberDiv } from 'components/Text/NumberLabel';
import { EXTERNAL_LINKS } from 'constants/links';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { setOpenModal } from 'state/app/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectHasRemainingMargin,
	selectPosition,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';
import { BorderedPanel, YellowIconButton, PillButtonSpan } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';

type Props = {
	accountType: FuturesAccountType;
	onManageBalance: () => void;
};

export default function TradePanelHeader({ accountType, onManageBalance }: Props) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const { openConnectModal } = useConnectModal();

	const position = useAppSelector(selectPosition);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const hasMargin = useAppSelector(selectHasRemainingMargin);
	const wallet = useAppSelector(selectWallet);

	const balance =
		accountType === 'isolated_margin' ? position?.remainingMargin ?? zeroBN : freeMargin;

	if (!wallet) {
		return (
			<DepositButton variant="yellow" onClick={openConnectModal}>
				<ButtonContent>{t('common.wallet.connect-wallet')}</ButtonContent>
			</DepositButton>
		);
	}

	if (!hasMargin) {
		return (
			<DepositButton
				variant="yellow"
				onClick={() =>
					dispatch(
						setOpenModal(
							accountType === 'isolated_margin'
								? 'futures_isolated_transfer'
								: 'futures_cross_deposit'
						)
					)
				}
			>
				<ButtonContent>
					Deposit Margin <SwitchAssetArrows fill={theme.colors.selectedTheme.button.yellow.text} />
				</ButtonContent>
			</DepositButton>
		);
	}

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
				<NumberDiv contrast="strong">{formatDollars(balance ?? zeroBN)}</NumberDiv>
				<BalanceButton>
					<StyledPillButtonSpan>
						<SwitchAssetArrows />
					</StyledPillButtonSpan>
				</BalanceButton>
			</BalanceRow>
		</Container>
	);
}

const StyledPillButtonSpan = styled(PillButtonSpan)`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 20px;
	width: 20px;
	margin-left: 0;
`;

const DepositButton = styled(Button)`
	height: 55px;
	width: 100%;
	margin-bottom: 16px;
`;

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
`;

const FAQLink = styled.div`
	&:hover {
		opacity: 0.5;
	}
	cursor: pointer;
	margin-left: 5px;
`;

const ButtonContent = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 10px;
`;
