import KwentaSDK from '..';
import { KwentaStatus } from '../types/system';
export default class SystemService {
    private sdk;
    constructor(sdk: KwentaSDK);
    getSynthetixStatus(): Promise<boolean>;
    getKwentaStatus(): Promise<KwentaStatus>;
}
