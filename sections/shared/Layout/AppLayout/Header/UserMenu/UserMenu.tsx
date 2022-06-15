import { FC, useState } from 'react';
import styled from 'styled-components';

import SettingsModal from 'sections/shared/modals/SettingsModal';
import UniswapModal from 'sections/shared/modals/UniswapModal';
import WalletButtons from './WalletButtons';

const UserMenu: FC = () => {
	const [settingsModalOpened, setSettingsModalOpened] = useState(false);
	const [uniswapWidgetOpened, setUniswapWidgetOpened] = useState(false);

	return (
		<>
			<Container>
				<WalletButtons
					settingsModalOpened={settingsModalOpened}
					uniswapWidgetOpened={uniswapWidgetOpened}
					setSettingsModalOpened={setSettingsModalOpened}
					setUniswapWidgetOpened={setUniswapWidgetOpened}
				/>
			</Container>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{uniswapWidgetOpened && <UniswapModal onDismiss={() => setUniswapWidgetOpened(false)} />}
		</>
	);
};

const Container = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-auto-flow: column;
`;

export default UserMenu;
