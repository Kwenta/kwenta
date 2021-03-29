import React, { FC } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import OneInch from './OneInch';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';
import L2Gas from './L2Gas';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<OneInch.Provider>
				<BlockExplorer.Provider>
					<TransactionNotifier.Provider>
						<L2Gas.Provider>{children}</L2Gas.Provider>
					</TransactionNotifier.Provider>
				</BlockExplorer.Provider>
			</OneInch.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
