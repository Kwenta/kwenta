import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
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

import getENSName from './UserMenu/getENSName';
import ConnectionDot from './ConnectionDot';

type ReactSelectOptionProps = {
	label: string;
	postfixIcon?: string;
	isMenuLabel?: boolean;
	onClick?: () => {};
};

export const WalletActions: FC = () => {
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

	const [ensName, setEns] = useState<string>('');
	const [walletLabel, setWalletLabel] = useState<string>('');
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
	}, [hardwareWallet]);

	const formatOptionLabel = ({
		label,
		isMenuLabel,
		postfixIcon,
		onClick,
	}: ReactSelectOptionProps) =>
		isMenuLabel ? (
			<>
				<StyledConnectionDot />
				{label}
			</>
		) : (
			<LabelContainer onClick={onClick}>
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Switch' ? (
						<img src={SwitchWalletIcon} height={17} />
					) : (
						<img src={DisconnectIcon} height={17} />
					))}
			</LabelContainer>
		);

	const DropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<StyledCaretDownIcon
					src={CaretDownIcon}
					viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`}
				/>
			</components.DropdownIndicator>
		);
	};

	useEffect(() => {
		if (signer) {
			setWalletLabel('loading...');
			signer.getAddress().then((account: string) => {
				const _account = account;
				getENSName(_account, staticMainnetProvider).then((_ensName: string) => {
					setEns(_ensName);
					setWalletLabel(_ensName || truncatedWalletAddress!);
				});
			});
		}
	}, [signer, truncatedWalletAddress]);

	return (
		<Container>
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
			></WalletOptionsSelect>
		</Container>
	);
};

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const Container = styled.div`
	width: 100%;
	font-size: 12px;
	font-family: AkkuratMonoLLWeb-Regular;
	margin-left: 15px;
`;

const WalletOptionsSelect = styled(Select)`
	min-width: 155px;

	.react-select__control {
		width: 155px;
		border-radius: 10px;
	}

	.react-select__dropdown-indicator {
		padding-right: 13px;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

const StyledCaretDownIcon = styled.img`
	width: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const LabelContainer = styled(FlexDivRow)`
	padding: 16px;
	font-size: 13px;
	width: 100%;
	color: ${(props) => props.theme.colors.white};
`;

export default WalletActions;
