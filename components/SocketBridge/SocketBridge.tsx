import { Bridge } from '@socket.tech/plugin';

import Connector from 'containers/Connector';

const SocketBridge = () => {
	const { signer } = Connector.useContainer();

	return signer?.provider ? (
		<div style={{ marginBottom: '20px' }}>
			<Bridge
				provider={signer.provider}
				API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY ?? ''}
				customize={{
					width: 360,
					responsiveWidth: false,
					borderRadius: 1,
					secondary: 'rgb(68,69,79)',
					primary: 'rgb(31,34,44)',
					accent: 'rgb(131,249,151)',
					onAccent: 'rgb(0,0,0)',
					interactive: 'rgb(0,0,0)',
					onInteractive: 'rgb(240,240,240)',
					text: 'rgb(255,255,255)',
					secondaryText: 'rgb(200,200,200)',
					fontFamily: 'AkkuratLLWeb-Regular',
				}}
			/>
		</div>
	) : null;
};

export default SocketBridge;
