import { FC, useState } from 'react';

import { FlexDivCentered } from 'styles/common';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import UniswapModal from 'sections/shared/modals/UniswapModal';
import WalletButtons from './WalletButtons';

const UserMenu: FC = () => {
	const [settingsModalOpened, setSettingsModalOpened] = useState(false);
	const [uniswapWidgetOpened, setUniswapWidgetOpened] = useState(false);

	return (
		<>
			<FlexDivCentered>
				<WalletButtons
					settingsModalOpened={settingsModalOpened}
					uniswapWidgetOpened={uniswapWidgetOpened}
					setSettingsModalOpened={setSettingsModalOpened}
					setUniswapWidgetOpened={setUniswapWidgetOpened}
				/>
			</FlexDivCentered>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{uniswapWidgetOpened && <UniswapModal onDismiss={() => setUniswapWidgetOpened(false)} />}
		</>
	);
};

export default UserMenu;
