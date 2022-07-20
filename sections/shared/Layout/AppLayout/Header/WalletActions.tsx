import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, useTheme } from 'styled-components';
import { FlexDivRow } from 'styles/common';

import Connector from 'containers/Connector';
import { truncatedWalletAddressState } from 'store/wallet';
import { useRecoilValue } from 'recoil';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import DisconnectIcon from 'assets/svg/app/disconnect.svg';
import SwitchWalletIcon from 'assets/svg/app/switch-wallet.svg';

import { components } from 'react-select';
import Select from 'components/Select';
import { IndicatorSeparator } from 'components/Select/Select';

import getENSName from './getENSName';
import ConnectionDot from './ConnectionDot';
import useENS from 'hooks/useENS';

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

	const DropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<StyledCaretDownIcon />
			</components.DropdownIndicator>
		);
	};

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
				dropdownIndicatorColor={theme.colors.blueberry}
				dropdownIndicatorColorHover={theme.colors.blueberry}
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

const StyledCaretDownIcon = styled(CaretDownIcon)`
	width: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const LabelContainer = styled(FlexDivRow)`
	padding: 16px;
	font-size: 13px;
	width: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	:hover {
		> svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
	> svg {
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.icon.fill};
		}
	}
`;

export default WalletActions;
