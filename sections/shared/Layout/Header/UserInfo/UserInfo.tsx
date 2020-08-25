import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import { isWalletConnectedState } from 'store/connection';

import NotConnected from './NotConnected';
import Connected from './Connected';

const UserInfo: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return isWalletConnected ? <Connected /> : <NotConnected />;
};

export default UserInfo;
