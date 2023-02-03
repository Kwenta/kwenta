import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useEnsAvatar, useEnsName } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { truncateAddress } from 'utils/formatters/string';

import ConnectionDot from '../ConnectionDot';

type MobileWalletButtonProps = {
	toggleModal(): void;
};

export const MobileWalletActions: FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const { walletAddress } = Connector.useContainer();
	const { data: ensAvatar } = useEnsAvatar({ address: walletAddress!, chainId: 1 });
	const { data: ensName } = useEnsName({ address: walletAddress!, chainId: 1 });
	const [walletLabel, setWalletLabel] = useState<string>('');
	const truncatedWalletAddress = truncateAddress(walletAddress! ?? '');

	useEffect(() => {
		setWalletLabel(ensName || truncatedWalletAddress!);
	}, [ensName, truncatedWalletAddress]);

	return (
		<StyledButton mono noOutline onClick={toggleModal}>
			{ensAvatar ? (
				<StyledImage src={ensAvatar} alt={ensName || walletAddress!} width={16} height={16} />
			) : (
				<ConnectionDot />
			)}
			{walletLabel}
		</StyledButton>
	);
};

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
