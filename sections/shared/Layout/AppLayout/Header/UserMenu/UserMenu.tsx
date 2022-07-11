import { FC, useState } from 'react';

import SettingsModal from 'sections/shared/modals/SettingsModal';
import WalletButtons from './WalletButtons';

const UserMenu: FC = () => {
	const [settingsModalOpened, setSettingsModalOpened] = useState(false);

	return (
		<>
			<WalletButtons
				settingsModalOpened={settingsModalOpened}
				setSettingsModalOpened={setSettingsModalOpened}
			/>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

export default UserMenu;
