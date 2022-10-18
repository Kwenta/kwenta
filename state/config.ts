import KwentaSDK from 'sdk';

import { wagmiClient } from 'containers/Connector/config';

export const sdk = new KwentaSDK(10, wagmiClient.provider, undefined);
