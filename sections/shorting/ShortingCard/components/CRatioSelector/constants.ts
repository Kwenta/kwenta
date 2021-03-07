export type ShortCRatioLevel = 'safe' | 'safeMax' | 'highRisk';

export const SHORT_C_RATIO: Record<ShortCRatioLevel, number> = {
	safe: 2,
	safeMax: 1.65,
	highRisk: 1.55,
};

export const shortCRatios = Object.entries(SHORT_C_RATIO) as [ShortCRatioLevel, number][];
