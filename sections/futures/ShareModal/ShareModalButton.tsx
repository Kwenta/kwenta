import { toPng } from 'html-to-image';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TwitterIcon from 'assets/svg/social/twitter.svg';
import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { FuturesPosition, PositionSide } from 'sdk/types/futures';
import {
	selectMarketAsset,
	selectMarketPrice,
	selectSelectedMarketPositionHistory,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';
import { getMarketName } from 'utils/futures';

function getTwitterText(
	side: PositionSide,
	marketName: string,
	leverage: string,
	pnlPct: string,
	dollarEntry: string,
	dollarCurrent: string
) {
	return encodeURIComponent(`Here is the PnL report of my position on @kwenta_io:

${side === 'long' ? 'Long' : 'Short'} $${marketName} ${leverage}: ${pnlPct}
from ${dollarEntry} to ${dollarCurrent}

https://kwenta.eth.limo`);
}

function downloadPng(dataUrl: string) {
	const link = document.createElement('a');

	link.download = 'my-pnl-on-kwenta.png';
	link.href = dataUrl;
	link.pathname = 'assets/png/' + link.download;
	link.click();
}

type ShareModalButtonProps = {
	position: FuturesPosition | null | undefined;
};

const ShareModalButton: FC<ShareModalButtonProps> = ({ position }) => {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketPrice = useAppSelector(selectMarketPrice);
	const currentPosition = useAppSelector(selectSelectedMarketPositionHistory);

	const handleDownloadImage = async () => {
		let node = document.getElementById('pnl-graphic');

		if (node) {
			const dataUrl = await toPng(node, { cacheBust: true });
			downloadPng(dataUrl);
		}
	};

	const handleTweet = () => {
		const positionDetails = position?.position ?? null;
		const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT;
		const marketName = getMarketName(marketAsset);
		const leverage = formatNumber(positionDetails?.leverage ?? zeroBN) + 'x';
		const pnlPct = `+${positionDetails?.pnlPct.mul(100).toNumber().toFixed(2)}%`;

		const avgEntryPrice = currentPosition?.avgEntryPrice
			? formatNumber(currentPosition?.avgEntryPrice)
			: '';
		const dollarEntry = formatDollars(avgEntryPrice ?? zeroBN, { isAssetPrice: true });
		const dollarCurrent = formatNumber(marketPrice);
		const text = getTwitterText(side, marketName, leverage, pnlPct, dollarEntry, dollarCurrent);
		window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
	};

	return (
		<>
			<DesktopOnlyView>
				<ButtonContainer>
					<Button variant="primary" onClick={handleDownloadImage} size="sm" disabled={false}>
						{t('futures.modals.share.buttons.download')}
					</Button>
				</ButtonContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<ButtonContainer>
					<Button variant="secondary" onClick={handleDownloadImage} size="sm" disabled={false}>
						{t('futures.modals.share.buttons.download')}
					</Button>
					<Button variant="primary" onClick={handleTweet} size="sm" disabled={false}>
						<InnerButtonContainer>
							<span>{t('futures.modals.share.buttons.twitter')}</span>
							<StyledTwitterIcon />
						</InnerButtonContainer>
					</Button>
				</ButtonContainer>
			</MobileOrTabletView>
		</>
	);
};

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 4vw;

	margin: 25px 0px 25px 0px;

	justify-content: center;
	align-items: center;
`;

const InnerButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	gap: 1vw;
`;

const StyledTwitterIcon = styled(TwitterIcon)`
	width: 2.5vw;
`;

export default ShareModalButton;
