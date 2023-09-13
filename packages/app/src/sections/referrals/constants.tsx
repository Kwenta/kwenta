import BronzeSmallIcon from 'assets/svg/referrals/bronze-small.svg'
import BronzeIcon from 'assets/svg/referrals/bronze.svg'
import GoldSmallIcon from 'assets/svg/referrals/gold-small.svg'
import GoldIcon from 'assets/svg/referrals/gold.svg'
import SilverSmallIcon from 'assets/svg/referrals/silver-small.svg'
import SilverIcon from 'assets/svg/referrals/silver.svg'
import { GridLayoutStyles } from 'components/Table/Table'

import { ReferralTiers, ReferralTierDetails } from './types'

export const MAX_REFERRAL_SCORE = 200

export const REFFERAL_TIERS: Record<ReferralTiers, ReferralTierDetails> = {
	[ReferralTiers.INVALID]: {
		title: '',
		tier: ReferralTiers.INVALID,
		displayTier: -1,
		icon: <></>,
		boost: 0,
		nftPreview: <></>,
		threshold: -1,
		animationUrl: '',
	},
	[ReferralTiers.BRONZE]: {
		title: 'referrals.affiliates.nft.bronze',
		tier: ReferralTiers.BRONZE,
		displayTier: ReferralTiers.BRONZE + 1,
		icon: <BronzeSmallIcon />,
		boost: 0.05,
		nftPreview: <BronzeIcon width={244} height={240} />,
		threshold: 0,
		animationUrl: '../images/referrals/bronze.gif',
	},
	[ReferralTiers.SILVER]: {
		title: 'referrals.affiliates.nft.silver',
		tier: ReferralTiers.SILVER,
		displayTier: ReferralTiers.SILVER + 1,
		icon: <SilverSmallIcon />,
		boost: 0.1,
		nftPreview: <SilverIcon width={244} height={240} />,
		threshold: 100,
		animationUrl: '../images/referrals/silver.gif',
	},
	[ReferralTiers.GOLD]: {
		title: 'referrals.affiliates.nft.gold',
		tier: ReferralTiers.GOLD,
		displayTier: ReferralTiers.GOLD + 1,
		icon: <GoldSmallIcon />,
		boost: 0.15,
		nftPreview: <GoldIcon width={244} height={240} />,
		threshold: 200,
		animationUrl: '../images/referrals/gold.gif',
	},
}

export const REFERRAL_TIERS_ARRAY: ReferralTierDetails[] = Object.values(REFFERAL_TIERS)

export const referralGridLayoutTable: GridLayoutStyles = {
	row: `
		@media (max-width: 1150px) {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			grid-column-gap: 25px;
			padding: 7.5px 25px;
		}
		`,
	cell: `
		@media (max-width: 1150px) {
			&:first-child {
				padding-left: 0px;
			}
		}
	`,
}
