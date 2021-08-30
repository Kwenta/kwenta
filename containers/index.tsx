import React, { FC } from 'react';

import Connector from './Connector';
import BlockExplorer from './BlockExplorer';
import TransactionNotifier from './TransactionNotifier';
import L2Gas from './L2Gas';
import Convert from './Convert';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<BlockExplorer.Provider>
			<Convert.Provider>
				<BlockExplorer.Provider>
					<TransactionNotifier.Provider>
						<L2Gas.Provider>{children}</L2Gas.Provider>
					</TransactionNotifier.Provider>
				</BlockExplorer.Provider>
			</Convert.Provider>
		</BlockExplorer.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
