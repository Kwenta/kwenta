import { OperationalStatus } from '../types/system';
export declare const StatusMap: {
    readonly '0': OperationalStatus.FullyOperational;
    readonly '1': OperationalStatus.Degraded;
    readonly '2': OperationalStatus.Offline;
};
