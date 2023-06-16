export declare enum OperationalStatus {
    FullyOperational = "Fully operational",
    Degraded = "Degraded",
    Offline = "Offline"
}
export type KwentaStatus = {
    status: OperationalStatus;
    message: string;
    lastUpdatedAt?: number;
};
