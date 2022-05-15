import { FC, useState } from 'react';

import { FlexDivCentered } from 'styles/common';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import UniswapModal from 'sections/shared/modals/UniswapModal';
import WalletButton from './WalletButton';

const UserMenu: FC = () => {
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [uniswapWidgetOpened, setUniswapWidgetOpened] = useState<boolean>(false);

	return (
		<>
			<FlexDivCentered>
				<WalletButton />
			</FlexDivCentered>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{uniswapWidgetOpened && <UniswapModal onDismiss={() => setUniswapWidgetOpened(false)} />}
		</>
	);
};

export default UserMenu;
