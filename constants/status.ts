export enum OperationalStatus {
	FullyOperational = 'Fully operational',
	Degraded = 'Degraded',
	Offline = 'Offline',
}

export const CURRENT_STATUS = {
	status: OperationalStatus.FullyOperational,
	message: undefined,
	lastUpdated: undefined,
} as const;
