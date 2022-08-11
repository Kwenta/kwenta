import { useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { components } from 'react-select';
import styled, { css, useTheme } from 'styled-components';
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import DisconnectIcon from 'assets/svg/app/disconnect.svg';
import LinkIcon from 'assets/svg/app/link-blue.svg';
import Select from 'components/Select';
import { IndicatorSeparator } from 'components/Select/Select';
import Connector from 'containers/Connector';
import { FlexDivRow } from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';

import ConnectionDot from './ConnectionDot';

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
	const { address } = useAccount();
	const { data: ensAvatar } = useEnsAvatar({ addressOrName: address, chainId: 1 });
	const { data: ensName } = useEnsName({ address, chainId: 1 });
	const { t } = useTranslation();
	const theme = useTheme();
	const { isHardwareWallet } = Connector.useContainer();
	const hardwareWallet = isHardwareWallet();

	const [walletLabel, setWalletLabel] = useState('');
	const truncatedWalletAddress = truncateAddress(address ?? '');
	const { openAccountModal } = useAccountModal();
	const { openChainModal } = useChainModal();
	const { disconnect } = useDisconnect();

	const WALLET_OPTIONS = useMemo(() => {
		let options = [
			{
				label: 'common.wallet.account-info',
				postfixIcon: 'Link',
				onClick: openAccountModal,
			},
			{
				label: 'common.wallet.disconnect-wallet',
				postfixIcon: 'Disconnet',
				onClick: disconnect,
			},
		];

		if (hardwareWallet) {
			options.push({
				label: 'common.wallet.switch-accounts',
				postfixIcon: 'Switch',
				onClick: openChainModal,
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
						alt={ensName?.toString()}
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
					(postfixIcon === 'Link' ? <LinkIcon height={17} /> : <DisconnectIcon height={17} />)}
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
		setWalletLabel(ensName || truncatedWalletAddress!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ensName, truncatedWalletAddress]);

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
