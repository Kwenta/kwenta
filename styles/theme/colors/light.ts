import common from './common';

const lightTheme = {
	...common.light,
	table: { fill: '#EEE', hover: '#E6E6E6' },
	gold: '#724713',
	badge: {
		red: { background: '#A80300', text: 'white' },
		yellow: { background: '#6A3300', text: 'white' },
	},
	tab: { background: { active: 'transparent', inactive: '#e8e8e8' } },
	button: {
		border: 'rgb(0 0 0 / 10%)',
		fill: '#e8e8e8',
		fillHover: '#f0f0f0',
		background:
			'linear-gradient(180deg, rgba(231, 231, 231, 0.6) 0%, rgba(203, 203, 203, 0.6) 100%)',
		hover: 'linear-gradient(180deg, rgba(231, 231, 231, 0.8) 0%, rgba(203, 203, 203, 0.8) 100%)',
		shadow:
			'0px 2px 2px rgb(0 0 0 / 5%), inset 0px 1px 0px rgb(255 255 255 / 8%), inset 0px 0px 20px rgb(255 255 255 / 3%)',
		text: {
			primary: '#171002',
			yellow: '#6A3300',
			white: '#FFFFFF',
		},
		primary: {
			background: 'linear-gradient(180deg, #BE9461 0%, #9C6C3C 100%)',
			hover: 'linear-gradient(180deg, #E4B378 0%, #B98C55 100%)',
			textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
		},
		secondary: { text: '#7D7D7F' },
		danger: { text: '#FF4747' },
		active: {
			shadow: 'inset 0px 0px 20px rgba(255, 255, 255, 0.03)',
			textShadow: '0px 1px 2px rgba(0, 0, 0, 0.4)',
			hover: {
				successBackground:
					'linear-gradient(180deg, rgba(127, 212, 130, 0.2) 0%, rgba(71, 122, 73, 0.2) 100%)',
				dangerBackground:
					'linear-gradient(180deg, rgba(239, 104, 104, 0.2) 0%, rgba(116, 56, 56, 0.2) 100%)',
				successBorder: 'rgba(127, 212, 130, 0.2)',
				dangerBorder: 'rgba(239, 104, 104, 0.2)',
			},
		},
		disabled: { text: '#B3B3B3', background: '#272727' },
		tab: {
			badge: {
				background: '#E4B378',
				text: common.secondaryGray,
				shadow: 'inset 0px 0.8px 0px rgba(255, 255, 255, 0.6)',
			},
			disabled: { border: '1px solid #353333', text: '#B3B3B3' },
		},
		pill: { background: common.light.yellow, text: common.light.yellow, hover: common.light.white },
	},
	input: {
		background: '#dbdbdb',
		secondary: {
			background: '#eaeaea',
		},
		placeholder: '#686868',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
		hover: common.black,
	},
	segmented: {
		background: '#eaeaea',
		button: {
			background: '#F2F2F2',
			shadow:
				'0px 2px 2px rgb(0 0 0 / 10%), inset 0px 0px 20px rgb(255 255 255 / 30%), inset 0px 1px 0px rgb(255 255 255 / 50%)',
			inactive: { color: '#787878' },
		},
	},
	slider: {
		label: '#787878',
		thumb: {
			border: '3px solid rgba(255, 255, 255, 0.4)',
			shadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.5)',
		},
		rail: {
			background: 'rgba(0, 0, 0, 0.2)',
		},
		track: {
			background: 'rgba(0, 0, 0, 0.3)',
			shadow: 'inset 0px 0.5px 0px rgba(255, 255, 255, 0.5)',
		},
	},
	select: {
		control: {
			shadow:
				'0px 2px 2px rgba(0, 0, 0, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03)',
		},
	},
	cell: {
		fill: '#EDEDED',
		gradient: 'linear-gradient(180deg, #1E1D1D 0%, #1b1a1a 100%)',
		hover: '#E6E6E6',
		outline: 'grey',
	},
	text: {
		title: common.secondaryGray,
		value: '#000000',
		label: common.secondaryGray,
		body: common.light.gray,
	},
	icon: {
		fill: '#515151',
		hover: '#171002',
		hoverReverse: common.dark.white,
	},
	openInterestBar: {
		border: '1px solid #F2F2F2',
	},
	modal: {
		background: '#F2F2F2',
	},
	competitionBanner: {
		border: '1px solid #C9C9C9',
		state: {
			text: '#171002',
		},
		bg: '#515151',
	},
	chartLine: {
		long: common.light.green,
	},
};

export default lightTheme;
