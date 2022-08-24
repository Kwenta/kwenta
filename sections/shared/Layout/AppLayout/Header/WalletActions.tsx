import { useAccountModal } from '@rainbow-me/rainbowkit';
import { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';

import Button from 'components/Button';
import { truncateAddress } from 'utils/formatters/string';

import ConnectionDot from './ConnectionDot';

type WalletActionsProps = {
	isMobile?: boolean;
};

export const WalletActions: FC<WalletActionsProps> = ({ isMobile }) => {
	const { address } = useAccount();
	const { data: ensAvatar } = useEnsAvatar({ addressOrName: address, chainId: 1 });
	const { data: ensName } = useEnsName({ address, chainId: 1 });

	const [walletLabel, setWalletLabel] = useState('');
	const truncatedWalletAddress = truncateAddress(address ?? '');
	const { openAccountModal } = useAccountModal();

	useEffect(() => {
		setWalletLabel(ensName || truncatedWalletAddress!);
	}, [ensName, truncatedWalletAddress]);

	return (
		<Container isMobile={isMobile}>
			<ConnectButton
				size="sm"
				variant="outline"
				noOutline
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
					<StyledConnectionDot />
				)}
				{walletLabel}
			</ConnectButton>
		</Container>
	);
};

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const Container = styled.div<{ isMobile?: boolean }>`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.mono};

	${(props) =>
		!props.isMobile &&
		css`
			width: 100%;
		`};
`;

const ConnectButton = styled(Button)<{ isName?: boolean }>`
	font-size: 13px;
	min-width: unset;
	text-transform: none;
	${(props) =>
		props.isName &&
		css`
			text-transform: lowercase;
		`};
`;

export default WalletActions;
