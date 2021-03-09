import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const NETWORKS: string[] = ['l1', 'l2'];

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const { t } = useTranslation();

	const activeNetwork = 'l1';
	const onToggleNetwork = async () => {};

	return (
		<Container onClick={onToggleNetwork}>
			{NETWORKS.map((network) => (
				<Button key={network} isActive={network === activeNetwork}>
					{t(`header.networks-switcher.${network}`)}
				</Button>
			))}
		</Container>
	);
};

export default NetworksSwitcher;

const Container = styled.div`
	width: 64px;
	padding: 4px;
	margin: 4px 0;
	display: grid;
	grid-template-columns: 1fr 1fr;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.elderberry};
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	line-height: 1;
	cursor: pointer;

	&:hover {
		opacity: 0.8;
	}
`;

const Button = styled.div<{ isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${(props) => (props.isActive ? props.theme.colors.navy : 'transparent')};
	color: ${(props) => props.theme.colors[props.isActive ? 'white' : 'blueberry']};
	border: 1px solid ${(props) => (props.isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
	border-radius: 2px;
	height: 18px;
`;
