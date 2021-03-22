import React, { FC } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import Notify from './Notify';
import Convert from './Convert';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<Convert.Provider>
				<Notify.Provider>{children}</Notify.Provider>
			</Convert.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
