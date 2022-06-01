import common from './common';

const lightTheme = {
	background: '#F2F2F2',
	border: '1px solid rgba(0, 0, 0, 0.1)',
	red: '#A80300',
	green: '#1D5D1F',
	black: '#171002',
	white: '#F2F2F2',
	gray: '#515151',
	table: '#EDEDED',
	gold: '#724713',
	button: {
		border: 'rgb(0 0 0 / 10%)',
		fill: '#e8e8e8',
		fillHover: '#f0f0f0',
		background:
			'linear-gradient(180deg, rgba(231, 231, 231, 0.6) 0%, rgba(203, 203, 203, 0.6) 100%)',
		hover: 'linear-gradient(180deg, rgba(231, 231, 231, 0.8) 0%, rgba(203, 203, 203, 0.8) 100%)',
		shadow:
			'0px 2px 3px rgb(0 0 0 / 10%), inset 0px 1px 0px rgb(255 255 255 / 8%), inset 0px 0px 20px rgb(255 255 255 / 3%)',
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
		background: 'transparent',
		secondary: {
			background: 'transparent',
		},
		placeholder: '#787878',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
	},
	segmented: {
		background: 'transparent',
		button: {
			background: '#dfdfdf',
			shadow:
				'0px 2px 2px rgb(0 0 0 / 10%), inset 0px 0px 20px rgb(255 255 255 / 30%), inset 0px 1px 0px rgb(255 255 255 / 50%)',
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
		fill: '#515151',
		hover: '#171002',
	},
};

export default lightTheme;
