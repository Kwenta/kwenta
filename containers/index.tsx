import React, { FC } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import Notify from './Notify';
import OneInch from './OneInch';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<OneInch.Provider>
				<BlockExplorer.Provider>
					<TransactionNotifier.Provider>
						<Notify.Provider>{children}</Notify.Provider>
					</TransactionNotifier.Provider>
				</BlockExplorer.Provider>
			</OneInch.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
