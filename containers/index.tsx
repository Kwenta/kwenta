import React, { FC } from 'react';

import Wallet from './Wallet';

type WithStateContainersProps = {
	children: React.ReactNode;
};

export const WithStateContainers: FC<WithStateContainersProps> = ({ children }) => (
	<Wallet.Provider>{children}</Wallet.Provider>
);

export default WithStateContainers;
