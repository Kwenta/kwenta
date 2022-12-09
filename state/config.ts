import KwentaSDK from 'sdk';

import { wagmiClient } from 'containers/Connector/config';

export const sdk = new KwentaSDK({ networkId: 10, provider: wagmiClient.webSocketProvider! });
