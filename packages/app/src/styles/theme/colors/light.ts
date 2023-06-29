import common from './common'

const newTheme = {
	containers: {
		primary: {
			background: common.palette.neutral.n10,
		},
		secondary: {
			background: common.palette.neutral.n0,
		},
		cards: {
			background: common.palette.neutral.n0,
		},
	},
	border: {
		color: common.palette.neutral.n40,
		yellow: common.palette.yellow.y900,
		style: `1px solid ${common.palette.neutral.n40}`,
	},
	button: {
		default: {
			border: `1px solid ${common.palette.neutral.n40}`,
			borderColor: common.palette.neutral.n40,
			background: common.palette.neutral.n20,
			color: common.palette.neutral.n900,
			hover: {
				background: common.palette.neutral.n30,
			},
		},
		tab: {
			active: common.palette.neutral.n1000,
			inactive: common.palette.neutral.n50,
		},
		position: {
			long: {
				color: common.palette.green.g900,
				active: {
					background: common.palette.green.g500,
					border: common.palette.green.g600,
					color: common.palette.neutral.n900,
				},
				hover: {
					background: common.palette.green.g600,
					border: common.palette.green.g700,
					color: common.palette.neutral.n0,
				},
			},
			short: {
				color: common.palette.red.r800,
				active: {
					background: common.palette.red.r400,
					border: common.palette.red.r500,
					color: common.palette.neutral.n900,
				},
				hover: {
					background: common.palette.red.r300,
					border: common.palette.red.r500,
					color: common.palette.neutral.n900,
				},
			},
		},
		cell: {
			background: 'transparent',
			hover: {
				background: common.palette.neutral.n20,
			},
		},
	},
	text: {
		primary: common.palette.neutral.n900,
		secondary: common.palette.neutral.n400,
		tertiary: common.palette.neutral,
		disabled: common.palette.neutral.n100,
		positive: common.palette.green.g800,
		negative: common.palette.red.r700,
		preview: common.palette.yellow.y800,
		warning: common.palette.yellow.y800,
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
			text: common.palette.neutral.n1100,
			background: common.palette.neutral.n20,
			border: common.palette.neutral.n70,
			outline: {
				text: common.palette.neutral.n1100,
				background: common.palette.neutral.n20,
				border: common.palette.neutral.n20,
			},
			hover: {
				background: common.palette.neutral.n30,
				text: common.palette.neutral.n900,
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
			background: common.palette.neutral.n20,
			border: common.palette.neutral.n70,
			outline: {
				background: common.palette.neutral.n20,
				text: common.palette.red.r300,
				border: common.palette.neutral.n20,
			},
			hover: {
				background: common.palette.neutral.n30,
				border: common.palette.alpha.white10,
				text: common.palette.neutral.n900,
			},
		},
	},
	banner: {
		yellow: {
			text: common.palette.yellow.y1000,
			background: common.palette.yellow.y300,
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
	checkBox: {
		border: common.palette.neutral.n50,
		background: common.palette.neutral.n20,
		checked: common.light.yellow,
	},
	tabs: {
		position: {
			background: common.palette.neutral.n20,
			color: common.palette.neutral.n100,
			long: {
				color: common.palette.green.g600,
				background: common.palette.green.g100,
			},
			short: {
				color: common.palette.red.r300,
				background: common.palette.alpha.red5,
			},
		},
	},
	pencilIcon: {
		color: common.palette.yellow.y900,
		hover: {
			color: common.palette.yellow.y500,
		},
	},
	fundingChart: {
		tooltip: {
			background: common.palette.neutral.n10,
			border: common.palette.neutral.n50,
		},
	},
}

const lightTheme = {
	...common.light,
	table: { fill: common.palette.neutral.n0, hover: common.palette.neutral.n20 },
	gold: '#724713',
	badge: {
		red: { background: '#FF8D8D', text: 'black' },
		yellow: { background: common.primaryYellow, text: 'black' },
		gray: { background: common.primaryGray, text: 'black' },
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
			disabled: { border: '1px solid #353333', text: '#B3B3B3' },
		},
		pill: { background: common.light.yellow, text: common.light.yellow, hover: common.light.white },
		yellow: {
			fill: common.light.yellow,
			fillHover: '#532800',
			border: '#532800',
			text: '#fff',
		},
		red: {
			fill: common.palette.red.r100,
			text: common.palette.red.r900,
		},
	},
	input: {
		background: common.palette.neutral.n0,
		border: `1px solid ${common.palette.neutral.n40}`,
		borderColor: common.palette.neutral.n40,
		placeholder: '#686868',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
		hover: common.black,
	},
	segmentedControl: {
		background: common.palette.neutral.n20,
		button: {
			background: common.palette.neutral.n0,
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
		header: '#171002',
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
		long: common.palette.green.g700,
		short: common.palette.red.r600,
		default: '#4094E8',
	},
	socket: {
		accent: `#d5d5d5`,
	},
	newTheme,
	imageInvert: { value: '1' },
}

export default lightTheme
