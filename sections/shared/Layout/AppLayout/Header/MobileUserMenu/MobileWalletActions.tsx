import { FC, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import useENS from 'hooks/useENS';
import { truncatedWalletAddressState } from 'store/wallet';

import ConnectionDot from '../ConnectionDot';
import getENSName from '../getENSName';

type MobileWalletButtonProps = {
	toggleModal(): void;
};

export const MobileWalletActions: FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const [address, setAddress] = useState('');
	const { ensAvatar } = useENS(address);
	const { signer, staticMainnetProvider } = Connector.useContainer();

	const [ensName, setEns] = useState('');
	const [walletLabel, setWalletLabel] = useState('');
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);

	useEffect(() => {
		if (signer) {
			setWalletLabel(truncatedWalletAddress!);
			signer.getAddress().then((account: string) => {
				const _account = account;
				setAddress(account);
				getENSName(_account, staticMainnetProvider).then((_ensName: string) => {
					setEns(_ensName);
					setWalletLabel(_ensName || truncatedWalletAddress!);
				});
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [signer, truncatedWalletAddress]);

	return (
		<StyledButton mono noOutline onClick={toggleModal}>
			{ensAvatar ? (
				<StyledImage src={ensAvatar} alt={ensName} width={16} height={16} />
			) : (
				<StyledConnectionDot />
			)}
			{walletLabel}
		</StyledButton>
	);
};

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
	text-transform: lowercase;
	height: 41px;
`;

const StyledImage = styled.img`
	border-radius: 50%;
	margin-right: 8px;
`;

export default MobileWalletActions;
