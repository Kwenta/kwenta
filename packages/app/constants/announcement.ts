import { MILLISECONDS_PER_DAY } from '@kwenta/sdk/constants';

// Shows or hides the home page banner entirely when set to true/false
export const BANNER_ENABLED = false;
// Sets the link destination for the banner component, or renders the banner as
// plain, un-clickable text if set to a falsey value (`false`, `null`, '', etc...)
export const BANNER_LINK_URL =
	'https://mirror.xyz/kwenta.eth/Z7hEjkIUDwSXI1VcpG6Z90cAufXWeoC6Gg-TWcIr6jQ';
// Sets the text displayed on the home page banner
export const BANNER_TEXT =
	'Optimism Bedrock upgrade planned for 16:00 UTC on June 6, 2023. Kwenta will be unavailable during the upgrade, and positions will be close-only for 48h prior to the upgrade. See the blog for details.';
// Sets the height of the banner component on desktop
export const BANNER_HEIGHT_DESKTOP = 50;
// Sets the height of the banner component on mobile
export const BANNER_HEIGHT_MOBILE = 85;
// Sets the waiting time of the banner component before it is reactive
export const BANNER_WAITING_TIME = 2 * MILLISECONDS_PER_DAY;
