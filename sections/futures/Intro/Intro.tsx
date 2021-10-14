import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import SignUp from './SignUp';
import Splash from './Splash';
import { isWalletConnectedState } from 'store/wallet';

import * as Styled from './styles';

const Intro: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return <Styled.Root>{!isWalletConnected ? <Splash /> : <SignUp />}</Styled.Root>;
};

export default Intro;
