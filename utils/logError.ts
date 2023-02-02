import * as Sentry from '@sentry/browser';

export default function logError(err: Error): void {
	// eslint-disable-next-line no-console
	console.error(err);
	if (!sentrySkipFilter(err)) {
		Sentry.captureException(err);
	}
}

const sentrySkipFilter = (e: Error) => {
	return IGNORE_ERRORS.some((text) => {
		return e.message?.toLowerCase().includes(text.toLowerCase());
	});
};

export const IGNORE_ERRORS = ['Insufficient margin', 'Network request failed', 'timeout exceeded'];
