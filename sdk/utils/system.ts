import { OperationalStatus } from '../types/system';

export const StatusMap = {
	'0': OperationalStatus.FullyOperational,
	'1': OperationalStatus.Degraded,
	'2': OperationalStatus.Offline,
} as const;
