export enum OperationalStatus {
	FullyOperational = 'Fully operational',
	Degraded = 'Degraded',
	Offline = 'Offline',
}

// The following object contains the configuration for the operation status
// at the bottom left of the screen.
// When the `message` value is omitted, it should be set to undefined.

export const CURRENT_STATUS = {
	status: OperationalStatus.Degraded,
	message: undefined,
	lastUpdated: undefined,
} as const;
