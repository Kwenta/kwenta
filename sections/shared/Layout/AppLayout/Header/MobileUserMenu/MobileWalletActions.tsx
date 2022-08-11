import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';

import Button from 'components/Button';
import { truncateAddress } from 'utils/formatters/string';

import ConnectionDot from '../ConnectionDot';

type MobileWalletButtonProps = {
	toggleModal(): void;
};

export const MobileWalletActions: FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const { address } = useAccount();
	const { data: ensAvatar } = useEnsAvatar({ addressOrName: address, chainId: 1 });
	const { data: ensName } = useEnsName({ address, chainId: 1 });
	const [walletLabel, setWalletLabel] = useState<string>('');
	const truncatedWalletAddress = truncateAddress(address ?? '');

	useEffect(() => {
		setWalletLabel(ensName || truncatedWalletAddress!);
	}, [ensName, truncatedWalletAddress]);

	return (
		<StyledButton mono noOutline onClick={toggleModal}>
			{ensAvatar ? (
				<StyledImage src={ensAvatar} alt={ensName || address} width={16} height={16} />
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
