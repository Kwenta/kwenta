import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css, useTheme } from 'styled-components';

import DisconnectIcon from 'assets/svg/app/disconnect.svg';
import SwitchWalletIcon from 'assets/svg/app/switch-wallet.svg';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { IndicatorSeparator, DropdownIndicator } from 'components/Select/Select';
import Connector from 'containers/Connector';
import useENS from 'hooks/useENS';
import { truncatedWalletAddressState } from 'store/wallet';

import ConnectionDot from './ConnectionDot';
import getENSName from './getENSName';

type ReactSelectOptionProps = {
	label: string;
	postfixIcon?: string;
	isMenuLabel?: boolean;
	onClick?: () => {};
};

type WalletActionsProps = {
	isMobile?: boolean;
};

export const WalletActions: FC<WalletActionsProps> = ({ isMobile }) => {
	const [address, setAddress] = useState('');
	const { ensAvatar } = useENS(address);
	const { t } = useTranslation();
	const theme = useTheme();
	const {
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		signer,
		staticMainnetProvider,
	} = Connector.useContainer();
	const hardwareWallet = isHardwareWallet();

	const [ensName, setEns] = useState('');
	const [walletLabel, setWalletLabel] = useState('');
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);

	const WALLET_OPTIONS = useMemo(() => {
		let options = [
			{ label: 'common.wallet.switch-wallet', postfixIcon: 'Switch', onClick: connectWallet },
			{
				label: 'common.wallet.disconnect-wallet',
				postfixIcon: 'Disconnet',
				onClick: disconnectWallet,
			},
		];

		if (hardwareWallet) {
			options.push({
				label: 'common.wallet.switch-accounts',
				postfixIcon: 'Switch',
				onClick: switchAccounts,
			});
		}

		return options;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hardwareWallet]);

	const formatOptionLabel = ({
		label,
		isMenuLabel,
		postfixIcon,
		onClick,
	}: ReactSelectOptionProps) =>
		isMenuLabel ? (
			<>
				{ensAvatar ? (
					<img
						src={ensAvatar}
						alt={ensName}
						width={16}
						height={16}
						style={{ borderRadius: '50%', marginRight: '8px' }}
					/>
				) : (
					<StyledConnectionDot />
				)}
				{label}
			</>
		) : (
			<LabelContainer onClick={onClick}>
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Switch' ? (
						<SwitchWalletIcon height={17} />
					) : (
						<DisconnectIcon height={17} />
					))}
			</LabelContainer>
		);

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
		<Container isMobile={isMobile}>
			<WalletOptionsSelect
				formatOptionLabel={formatOptionLabel}
				controlHeight={41}
				options={WALLET_OPTIONS}
				value={{ label: walletLabel, isMenuLabel: true }}
				valueContainer={{ 'text-transform': ensName ? 'lowercase' : '' }}
				menuWidth={240}
				optionPadding={'0px'} //override default padding to 0
				optionBorderBottom={`1px solid ${theme.colors.navy}`}
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
				data-testid="wallet-btn"
				noOutline
			/>
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

const WalletOptionsSelect = styled(Select)`
	min-width: 155px;

	.react-select__control {
		width: 155px;
		border-radius: 10px;
	}

	.react-select__dropdown-indicator {
		margin-right: 5px;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

export default WalletActions;
