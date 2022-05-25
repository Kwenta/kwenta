import common from './common';

const lightTheme = {
	background: '#F2F2F2',
	border: '1px solid rgba(0, 0, 0, 0.1)',
	red: '#FF4747',
	green: '#329b36',
	black: '#171002',
	button: {
		background:
			'linear-gradient(180deg, rgba(231, 231, 231, 0.5) 0%, rgba(203, 203, 203, 0.5) 100%)',
		fill: '#E6E6E6',
		hover: '#e6e6e6',
		shadow:
			'0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03)',
		text: '#171002',
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
	},
	input: {
		background: 'linear-gradient(180deg, #1B1B1B 0%, rgba(27, 27, 27, 0.75) 100%)',
		secondary: {
			background: 'linear-gradient(180deg, #1B1B1B 0%, rgba(27, 27, 27, 0.3) 100%)',
		},
		placeholder: '#787878',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
	},
	segmented: {
		background: 'linear-gradient(180deg, #1B1B1B 0%, #212121 100%)',
		button: {
			background: 'linear-gradient(180deg, #262322 0%, #39332D 100%)',
			shadow:
				'0px 4px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.5), inset 0px 0px 20px rgba(255, 255, 255, 0.03), inset 0px 1px 0px rgba(255, 255, 255, 0.09)',
			inactive: { color: '#787878' },
		},
	},
	slider: {
		label: '#787878',
		thumb: { shadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.5)' },
		track: { shadow: 'inset 0px 0.5px 0px rgba(255, 255, 255, 0.5)' },
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
	},
	icon: {
		fill: '#787878',
		hover: '#171002',
	},
};

export default lightTheme;
