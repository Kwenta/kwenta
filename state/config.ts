import KwentaSDK from 'sdk/src';

import { wagmiClient } from 'containers/Connector/config';
import logError from 'utils/logError';

export const sdk = new KwentaSDK({ networkId: 10, provider: wagmiClient.provider, logError });
