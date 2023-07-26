import common from './common'

const newTheme = {
	containers: {
		primary: {
			background: common.palette.neutral.n1000,
		},
		secondary: {
			background: common.palette.neutral.n900,
		},
		cards: {
			background: common.palette.neutral.n900,
		},
	},
	border: {
		color: common.palette.neutral.n700,
		yellow: common.palette.yellow.y900,
		style: `1px solid ${common.palette.neutral.n700}`,
	},
	button: {
		default: {
			border: `1px solid ${common.palette.neutral.n700}`,
			borderColor: common.palette.neutral.n700,
			background: common.palette.neutral.n800,
			color: common.palette.neutral.n0,
			hover: {
				background: common.palette.neutral.n800,
			},
		},
		tab: {
			active: common.palette.neutral.n0,
			inactive: common.palette.neutral.n500,
		},
		position: {
			long: {
				active: {
					background: common.palette.green.g500,
					border: common.palette.green.g600,
					color: common.palette.neutral.n900,
				},
				hover: {
					background: common.palette.green.g600,
					border: common.palette.green.g700,
					color: common.palette.neutral.n900,
				},
			},
			short: {
				active: {
					background: common.palette.red.r300,
					border: common.palette.red.r300,
					color: common.palette.neutral.n900,
				},
				hover: {
					background: common.palette.red.r400,
					border: common.palette.red.r400,
					color: common.palette.neutral.n900,
				},
			},
		},
		cell: {
			background: 'transparent',
			hover: {
				background: common.palette.neutral.n800,
			},
		},
	},
	text: {
		primary: common.palette.neutral.n0,
		secondary: common.palette.neutral.n70,
		tertiary: common.palette.neutral.n100,
		disabled: common.palette.neutral.n200,
		positive: common.palette.green.g500,
		negative: common.palette.red.r300,
		preview: common.palette.yellow.y500,
		warning: common.palette.yellow.y500,
		sectionHeader: common.palette.yellow.y500,
	},
	banner: {
		yellow: {
			text: common.palette.yellow.y500,
			background: common.palette.yellow.y1000,
		},
	},
	badge: {
		yellow: {
			text: common.palette.neutral.n900,
			background: common.palette.yellow.y500,
			dark: {
				background: common.palette.yellow.y1000,
				text: common.palette.yellow.y500,
				border: common.palette.alpha.white10,
			},
		},
		gray: {
			text: common.palette.neutral.n900,
			background: common.palette.neutral.n50,
			dark: {
				background: common.palette.neutral.n100,
				text: common.palette.neutral.n900,
				border: common.palette.alpha.white10,
			},
		},
		red: {
			text: common.palette.neutral.n900,
			background: common.palette.red.r300,
			dark: {
				background: common.palette.alpha.red10,
				text: common.palette.red.r300,
				border: common.palette.alpha.white10,
			},
		},
	},
	pill: {
		yellow: {
			text: common.palette.yellow.y500,
			background: common.palette.yellow.y1000,
			border: common.palette.alpha.white10,
			outline: {
				background: 'transparent',
				text: common.palette.yellow.y500,
				border: common.palette.yellow.y500,
			},
			hover: {
				background: common.palette.yellow.y500,
				border: common.palette.alpha.white10,
				text: common.palette.neutral.n900,
			},
		},
		gray: {
			text: common.palette.neutral.n70,
			background: common.palette.neutral.n800,
			border: common.palette.neutral.n600,
			outline: {
				text: common.palette.neutral.n900,
				background: common.palette.neutral.n20,
				border: common.palette.alpha.white10,
			},
			hover: {
				background: common.palette.neutral.n700,
				border: common.palette.alpha.white10,
				text: common.palette.neutral.n30,
			},
		},
		red: {
			text: common.palette.red.r300,
			background: common.palette.alpha.red10,
			border: common.palette.red.r300,
			outline: {
				background: 'transparent',
				text: common.palette.red.r300,
				border: common.palette.red.r300,
			},
			hover: {
				background: common.palette.red.r500,
				border: common.palette.alpha.white10,
				text: common.palette.neutral.n900,
			},
		},
		redGray: {
			text: common.palette.red.r300,
			background: common.palette.neutral.n800,
			border: common.palette.neutral.n600,
			outline: {
				background: common.palette.neutral.n20,
				text: common.palette.red.r300,
				border: common.palette.alpha.white10,
			},
			hover: {
				background: common.palette.neutral.n700,
				border: common.palette.alpha.white10,
				text: common.palette.neutral.n30,
			},
		},
	},
	checkBox: {
		default: {
			text: common.palette.neutral.n70,
			border: common.palette.neutral.n500,
			background: common.palette.neutral.n700,
			checked: common.palette.yellow.y500,
		},
		yellow: {
			text: common.palette.yellow.y500,
			border: common.palette.yellow.y500,
			background: common.palette.neutral.n700,
			checked: common.palette.yellow.y500,
		},
	},
	tabs: {
		position: {
			background: common.palette.neutral.n1100,
			color: common.palette.neutral.n70,
			long: {
				color: common.palette.green.g600,
				background: common.palette.alpha.green5,
			},
			short: {
				color: common.palette.red.r300,
				background: common.palette.alpha.red5,
			},
		},
	},
	pencilIcon: {
		color: common.palette.yellow.y500,
		hover: {
			color: common.palette.yellow.y900,
		},
	},
	fundingChart: {
		tooltip: {
			background: common.palette.neutral.n700,
			border: common.palette.neutral.n600,
		},
	},
	exchange: {
		card: common.palette.neutral.n900,
		ratioSelect: {
			background: common.palette.neutral.n700,
		},
	},
}

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
			disabled: { border: '1px solid #353333', text: '#353333' },
		},
		pill: { background: common.dark.yellow, text: common.dark.yellow, hover: common.black },
		yellow: {
			fill: '#3E2D00',
			fillHover: '#513C05',
			border: '#514219',
			text: common.dark.yellow,
		},
		red: {
			fill: common.palette.alpha.red15,
			text: common.palette.red.r200,
		},
	},
	input: {
		background: common.palette.neutral.n1100,
		border: `1px solid ${common.palette.neutral.n700}`,
		borderColor: common.palette.neutral.n700,
		secondary: {
			background: '#0b0b0b',
		},
		placeholder: '#787878',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
		hover: common.dark.white,
	},
	segmentedControl: {
		background: common.palette.neutral.n1100,
		button: {
			background: common.palette.neutral.n800,
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
		long: common.palette.green.g700,
		short: common.palette.red.r600,
		default: '#4094E8',
	},
	socket: {
		accent: `#252525`,
	},
	newTheme,
	imageInvert: { value: '0' },
}

export default darkTheme
