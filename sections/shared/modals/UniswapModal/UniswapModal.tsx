import { Synths } from '@synthetixio/contracts-interface';
import { SwapWidget, Theme, TokenInfo } from '@uniswap/widgets';
import '@uniswap/widgets/dist/fonts.css';

import BaseModal from 'components/BaseModal';
import Connector from 'containers/Connector';
import { FC } from 'react';
import styled from 'styled-components';
import { getInfuraRpcURL } from 'utils/infura';

import DEFAULT_TOKEN_LIST from './defaultTokenList.json';

// special referece on the uniswap widget
// represents the Native Token of the current chain (typically ETH)
const NATIVE = 'NATIVE';

type UniswapModalProps = {
	onDismiss: () => void;
	isOpen?: boolean;
	tokenList?: TokenInfo[];
	inputTokenAddress?: string;
	outputTokenAddress?: string;
};

const theme: Theme = {
	primary: '#ECE8E3', // primary white
	secondary: '#C3C0BA', // tertiary grey
	interactive: '#C3C0BA', // tertiary grey
	container: '#1E1D1D', // cell gradient
	module: '#474747', // custom
	accent: '#C9975B',
	dialog: '#1E1D1D', // cell gradient
	fontFamily: 'AkkuratLLWeb-Regular',
	borderRadius: 0.8,
	error: '#EF6868',
	// outline: '',
	// onAccent: '',
	// onInteractive: '',
	// hint: '',
	active: '#407CF8',
	success: '#1A9550',
	warning: '#EF6868',
	// tokenColorExtraction: true,
};

const UniswapModal: FC<UniswapModalProps> = ({
	isOpen = true,
	onDismiss,
	tokenList,
	inputTokenAddress,
	outputTokenAddress,
}) => {
	const { provider, network } = Connector.useContainer();
	const infuraRpc = getInfuraRpcURL(network.id);
	const normalizedTokenList = (tokenList || DEFAULT_TOKEN_LIST).filter(
		(t) => t.chainId === network.id
	);
	const OUTPUT_TOKEN_ADDRESS =
		outputTokenAddress || normalizedTokenList.find((t) => t.symbol === Synths.sUSD)?.address!;

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={isOpen} title="">
			<div className="Uniswap">
				<SwapWidget
					theme={theme}
					provider={provider as any}
					jsonRpcEndpoint={infuraRpc}
					tokenList={normalizedTokenList}
					defaultInputTokenAddress={inputTokenAddress || NATIVE}
					defaultOutputTokenAddress={OUTPUT_TOKEN_ADDRESS}
					onError={(error, info) => console.error(error, info)}
				/>
			</div>
		</StyledBaseModal>
	);
};

export default UniswapModal;

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: fit-content;
	}

	.card-header {
		display: none;
	}

	.card-body {
		padding: 0px;
		padding-top: 0px;
	}
`;
