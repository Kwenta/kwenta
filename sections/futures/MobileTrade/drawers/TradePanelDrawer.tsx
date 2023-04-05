import { FC } from 'react';
import styled from 'styled-components';

import FullScreenModal from 'components/FullScreenModal';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';

type TradePanelDrawerProps = {
	open: boolean;
	closeDrawer(): void;
};
const TradePanelDrawer: FC<TradePanelDrawerProps> = ({ open, closeDrawer }) => {
	return (
		<StyledModal isOpen={open}>
			<Background onClick={closeDrawer}>
				<TradeIsolatedMargin mobile />
			</Background>
		</StyledModal>
	);
};

const StyledModal = styled(FullScreenModal)``;

const Background = styled.div`
	background-color: rgba(0, 0, 0, 0.5);
	height: 100%;
	width: 100%;
`;

export default TradePanelDrawer;
