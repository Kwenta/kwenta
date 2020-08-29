import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { isWalletConnectedState } from 'store/connection';

import NotConnected from './NotConnected';
import Connected from './Connected';

const UserInfo: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return <Container>{isWalletConnected ? <Connected /> : <NotConnected />}</Container>;
};

const Container = styled.div`
	margin-top: 8px;
`;

export default UserInfo;
