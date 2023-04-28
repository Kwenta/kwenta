import * as Sentry from '@sentry/browser';

export default function logError(err: Error, skipReport = false): void {
	// eslint-disable-next-line no-console
	console.error(err);
	if (!sentrySkipFilter(err) && !skipReport) {
		Sentry.captureException(err);
	}
}

const sentrySkipFilter = (e: Error) => {
	return IGNORE_ERRORS.some((text) => {
		return e?.message?.toLowerCase().includes(text.toLowerCase());
	});
};

export const IGNORE_ERRORS = [
	'Insufficient margin',
	'Network request failed',
	'Network error',
	'timeout exceeded',
	'Unsupported network',
	'request aborted',
	'Transaction reverted without a reason string',
];
