import common from './common';

const newTheme = {
	button: {
		position: {
			border: common.palette.neutral.n700,
			long: {
				color: common.palette.green.g500,
				active: {
					background: common.palette.green.g500,
					border: common.palette.green.g600,
					color: common.palette.neutral.n900,
				},
			},
			short: {
				color: common.palette.red.r300,
				active: {
					background: common.palette.red.r400,
					border: common.palette.red.r500,
					color: common.palette.neutral.n900,
				},
			},
			background: common.palette.alpha.darkButton,
			hover: {
				background: common.palette.alpha.darkButtonHover,
			},
		},
	},
	text: {
		primary: '',
		secondary: '',
		tertiary: '',
		number: {
			positive: '',
			negative: '',
			neutral: '',
		},
	},
	badge: {},
};

const darkTheme = {
	...common.dark,
	red: common.dark.red,
	green: common.dark.green,
	black: common.dark.black,
	white: common.dark.white,
	yellow: common.primaryYellow,
	table: { fill: 'rgba(255, 255, 255, 0.01)', hover: 'rgba(255, 255, 255, 0.05)' },
	gold: '#E4B378',
	badge: {
		red: { background: common.dark.red, text: 'black' },
		yellow: { background: common.primaryYellow, text: 'black' },
		gray: { background: common.primaryGray, text: 'black' },
	},
	tab: { background: { active: '#252525', inactive: 'transparent' } },
	button: {
		border: 'rgb(255 255 255 / 10%)',
		fill: '#252525',
		fillHover: '#2B2A2A',
		background: 'linear-gradient(180deg, #282727 0%, #191818 100%)',
		hover: 'linear-gradient(180deg, #383838 0%, #383838 0.01%, #1E1E1E 100%)',
		shadow:
			'rgb(0 0 0 / 25%) 0px 2px 2px, rgb(255 255 255 / 10%) 0px 1px 0px inset, rgb(255 255 255 / 3%) 0px 0px 20px inset',
		text: {
			primary: common.primaryWhite,
			yellow: common.primaryYellow,
		},
		primary: {
			background: 'linear-gradient(180deg, #BE9461 0%, #9C6C3C 100%)',
			hover: 'linear-gradient(180deg, #E4B378 0%, #B98C55 100%)',
			textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
		},
		secondary: { text: '#E4B378' },
		danger: { text: common.dark.red },
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
		disabled: { text: '#555555', background: 'transparent' },
		tab: {
			badge: {
				background: '#E4B378',
				text: '#282626',
				shadow: 'inset 0px 0.8px 0px rgba(255, 255, 255, 0.6)',
			},
			disabled: { border: '1px solid #353333', text: '#353333' },
		},
		pill: { background: common.dark.yellow, text: common.dark.yellow, hover: common.black },
		yellow: {
			fill: '#3E2D00',
			fillHover: '#513C05',
			border: '#514219',
			text: common.dark.yellow,
		},
	},
	input: {
		background: '#151515',
		secondary: {
			background: '#0b0b0b',
		},
		placeholder: '#787878',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
		hover: common.dark.white,
	},
	segmented: {
		background: '#0b0b0b',
		button: {
			background: '#1F1E1E',
			shadow:
				'0px 4px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.5), inset 0px 0px 20px rgba(255, 255, 255, 0.03), inset 0px 1px 0px rgba(255, 255, 255, 0.09)',
			inactive: { color: '#787878' },
		},
	},
	slider: {
		label: '#787878',
		thumb: {
			border: '3px solid rgba(43, 42, 42, 0.5)',
			shadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.5)',
		},
		rail: {
			background: 'rgba(255, 255, 255, 0.2)',
		},
		track: {
			background: 'rgba(255, 255, 255, 0.2)',
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
		fill: '#1E1D1D;',
		gradient: 'linear-gradient(180deg, #1E1D1D 0%, #1b1a1a 100%)',
		hover: '#222222',
		outline: '#2B2A2A',
	},
	text: {
		header: '#B1B1B1',
		value: common.primaryWhite,
		label: common.neautralGray,
		body: common.dark.gray,
	},
	icon: {
		fill: '#787878',
		hover: '#ECE8E3',
		hoverReverse: common.dark.black,
	},
	openInterestBar: {
		border: '1px solid #2b2a2a',
	},
	modal: {
		background: '#252525',
	},
	competitionBanner: {
		border: '1px solid #2b2a2a',
		state: {
			text: common.primaryWhite,
		},
		bg: '#fff',
	},
	chartLine: {
		long: '#37A141',
	},
	socket: {
		accent: `#252525`,
	},
	newTheme,
};

export default darkTheme;
