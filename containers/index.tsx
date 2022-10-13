import React, { FC } from 'react';

import BlockExplorer from './BlockExplorer';
import Connector from './Connector';
import Convert from './Convert';
import TransactionNotifier from './TransactionNotifier';

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
