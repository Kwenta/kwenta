const goldColors = {
	color1: '#BE9461',
	color2: '#9C6C3C',
	color3: '#E4B378',
	color4: '#B98C55',
};

// Common colors shared between themes.
const common = {
	primaryWhite: '#ECE8E3',
	primaryGold: '#C9975B',
	primaryRed: '#EF6868',
	primaryGreen: '#7FD482',
	secondaryGray: '#787878',
};

const defaultTheme = {
	background: '#474747',
	border: '1px solid rgba(255, 255, 255, 0.1);',
	button: {
		background: 'linear-gradient(180deg, #39332D 0%, #2D2A28 100%)',
		hover: 'linear-gradient(180deg, #4F463D 0%, #332F2D 100%)',
		shadow: '0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 0px 20px rgba(255, 255, 255, 0.03)',
		active: {
			shadow: 'inset 0px 0px 20px rgba(255, 255, 255, 0.03)',
			textShadow: '0px 1px 2px rgba(0, 0, 0, 0.4)',
			hover: {
				successBackground:
					'linear-gradient(180deg, rgba(127, 212, 130, 0.15) 0%, rgba(71, 122, 73, 0.15) 100%)',
				dangerBackground:
					'linear-gradient(180deg, rgba(239, 104, 104, 0.5) 0%, rgba(116, 56, 56, 0.5) 100%)',
				successBorder: 'rgba(127, 212, 130, 0.2)',
				dangerBorder: 'rgba(239, 104, 104, 0.2)',
			},
		},
		disabled: {
			text: '#544F4D',
			background: '#2A2827',
		},
	},
	input: {
		background: 'linear-gradient(180deg, #1B1B1B 0%, rgba(27, 27, 27, 0.75) 100%)',
		secondary: {
			background: 'linear-gradient(180deg, #1B1B1B 0%, rgba(27, 27, 27, 0.3) 100%)',
		},
		placeholder: '#787878',
		shadow: 'box-shadow: 0px 0.5px 0px rgba(255, 255, 255, 0.08)',
	},
	segmented: {
		background: 'linear-gradient(180deg, #1B1B1B 0%, #212121 100%)',
		button: {
			background: 'linear-gradient(180deg, #262322 0%, #39332D 100%);',
			shadow:
				'0px 4px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.5), inset 0px 0px 20px rgba(255, 255, 255, 0.03), inset 0px 1px 0px rgba(255, 255, 255, 0.09);',
			inactive: {
				color: '#787878',
			},
		},
	},
	slider: {
		label: '#787878',
		thumb: {
			hover: {
				shadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.5)',
			},
		},
		track: {
			shadow: 'inset 0px 0.5px 0px rgba(255, 255, 255, 0.5)',
		},
	},

	gradientFill:
		'linear-gradient(180deg, rgba(228, 179, 120, 0.1) 0%, rgba(135, 105, 70, 0.08) 100%)',
};

export default {
	black: '#000000',
	vampire: '#08080F',
	elderberry: '#10101E',
	navy: '#1A1A2E',
	stormcloud: '#57616B',
	blueberry: '#9F9EC5',
	silver: '#8A939F',
	white: '#FFFFFF',
	red: '#CB366D',
	redHover: '#FF568F',
	green: '#66DD84',
	yellow: '#FFDF6D',
	goldColors,
	gold: `linear-gradient(180deg, ${goldColors.color1} 0%, ${goldColors.color2} 100%)`,
	goldHover: `linear-gradient(180deg, ${goldColors.color3} 0%, ${goldColors.color4} 100%)`,
	// network colors
	mainnet: '#29B6AF',
	ropsten: '#FF4A8D',
	kovan: '#7057FF',
	rinkeby: '#F6C343',
	goerli: 'rgb(48, 153, 242)',
	connectedDefault: goldColors.color1,
	noNetwork: 'rgb(155, 155, 155)',
	transparentBlack: 'rgba(0, 0, 0, 0.5)',
	common,
	defaultTheme,
};
