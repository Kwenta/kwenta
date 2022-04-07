import React, { FC } from 'react';

import Connector from './Connector';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';
import Convert from './Convert';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<BlockExplorer.Provider>
			<Convert.Provider>
				<TransactionNotifier.Provider>{children}</TransactionNotifier.Provider>
			</Convert.Provider>
		</BlockExplorer.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
