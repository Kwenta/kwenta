import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isL2State, networkState } from 'store/wallet';
import Select from 'components/Select';
import Img, { Svg } from 'react-optimized-image';
import { ExternalLink, FlexDivRowCentered } from 'styles/common';
import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import SwitchIcon from 'assets/svg/app/switch.svg';
import LinkIcon from 'assets/svg/app/link-blue.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import BlockExplorer from 'containers/BlockExplorer';
import { components } from 'react-select';
import { IndicatorSeparator } from 'components/Select/Select';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { EXTERNAL_LINKS } from 'constants/links';

type ReactSelectOptionProps = {
	label: string;
	prefixIcon?: string;
	postfixIcon?: string;
	link?: string;
	onClick?: () => {};
};

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const { switchToL1, switchToL2 } = useNetworkSwitcher();
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState).id === 69 ? 'testnet' : 'mainnet';
	const networkLabel = 'header.networks-switcher.optimism-' + network;
	const theme = useTheme();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const OPTIMISM_OPTIONS = [
		{ label: 'header.networks-switcher.l1', postfixIcon: 'Switch', onClick: switchToL1 },
		{
			label: 'header.networks-switcher.optimistic-gateway',
			postfixIcon: 'Link',
			link: 'https://gateway.optimism.io/',
		},
		{
			label: 'header.networks-switcher.optimistic-etherscan',
			postfixIcon: 'Link',
			link: blockExplorerInstance?.baseLink,
		},
		{
			label: 'header.networks-switcher.learn-more',
			postfixIcon: 'Link',
			link: EXTERNAL_LINKS.Docs.DocsRoot,
		},
	];

	const formatOptionLabel = ({
		label,
		prefixIcon,
		postfixIcon,
		link,
		onClick,
	}: ReactSelectOptionProps) => (
		<ExternalLink href={link} onClick={onClick}>
			<LabelContainer noPadding={!!prefixIcon}>
				{prefixIcon === 'Optimism' && <PrefixIcon src={OptimismIcon} height={17} />}
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Link' ? <Svg src={LinkIcon} /> : <Svg src={SwitchIcon} />)}
			</LabelContainer>
		</ExternalLink>
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

	return !isL2 ? (
		<Container onClick={switchToL2}>
			<Button>{t('header.networks-switcher.l2')}</Button>
		</Container>
	) : (
		<Container>
			<L2Select
				formatOptionLabel={formatOptionLabel}
				controlHeight={41}
				options={OPTIMISM_OPTIONS}
				value={{ label: 'L2', prefixIcon: 'Optimism' }}
				menuWidth={240}
				optionPadding={'0px'} //override default padding to 0
				optionBorderBottom={`1px solid ${theme.colors.navy}`}
				dropdownIndicatorColor={theme.colors.blueberry}
				dropdownIndicatorColorHover={theme.colors.blueberry}
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
			></L2Select>
		</Container>
	);
};

export default NetworksSwitcher;

const Container = styled.div`
	margin: 4px 0;
	font-size: 12px;
	font-weight: bold;
	line-height: 1;
	cursor: pointer;
`;

const Button = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	height: 28px;
	width: 110px;
	padding: 0px 16px;
	background: ${(props) => props.theme.colors.elderberry};
	color: ${(props) => props.theme.colors.goldColors.color4};
	:hover {
		background: ${(props) => props.theme.colors.goldHover};
		color: ${(props) => props.theme.colors.white};
	}
`;

const L2Select = styled(Select)`
	width: 85px;

	.react-select__control {
		border-radius: 10px;
	}

	.react-select__dropdown-indicator {
		padding-right: 13px;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

const PrefixIcon = styled(Img)`
	padding-right: 6px;
`;

const StyledCaretDownIcon = styled(Svg)`
	width: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const LabelContainer = styled(FlexDivRowCentered)<{ noPadding: boolean }>`
	padding: ${(props) => !props.noPadding && '16px'};
	font-size: 13px;
`;
