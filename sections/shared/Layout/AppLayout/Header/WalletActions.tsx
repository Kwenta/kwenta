import { useAccountModal } from '@rainbow-me/rainbowkit';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useEnsAvatar, useEnsName } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { truncateAddress } from 'utils/formatters/string';

import ConnectionDot from './ConnectionDot';

export const WalletActions: FC = () => {
	const { walletAddress } = Connector.useContainer();
	const { data: ensAvatar } = useEnsAvatar({ address: walletAddress!, chainId: 1 });
	const { data: ensName } = useEnsName({ address: walletAddress!, chainId: 1 });

	const truncatedWalletAddress = truncateAddress(walletAddress ?? '');
	const { openAccountModal } = useAccountModal();

	const walletLabel = useMemo(() => {
		return ensName || truncatedWalletAddress!;
	}, [ensName, truncatedWalletAddress]);

	return (
		<Container>
			<ConnectButton
				size="small"
				variant="flat"
				onClick={openAccountModal}
				data-testid="connect-wallet"
				mono
				isName={!!ensName}
			>
				{ensAvatar ? (
					<img
						src={ensAvatar}
						alt={ensName?.toString()}
						width={16}
						height={16}
						style={{ borderRadius: '50%', marginRight: '8px' }}
					/>
				) : (
					<ConnectionDot />
				)}
				{walletLabel}
			</ConnectButton>
		</Container>
	);
};

const Container = styled.div`
	font-size: 12px;
`;

const ConnectButton = styled(Button)<{ isName?: boolean }>`
	min-width: unset;
	text-transform: ${(props) => (props.isName ? 'lowercase' : 'none')};
`;

export default WalletActions;
