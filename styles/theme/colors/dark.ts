import common from './common';

const darkTheme = {
	background: '#131212',
	border: '1px solid rgba(255, 255, 255, 0.12)',
	red: '#EF6868',
	green: '#7FD482',
	black: '#171002',
	white: '#ECE8E3',
	gray: '#787878',
	gray2: '#3F3F3F',
	yellow: '#FFB800',
	table: { fill: 'rgba(255, 255, 255, 0.01)', hover: 'rgba(255, 255, 255, 0.05)' },
	gold: '#E4B378',
	badge: { background: '#EF6868', text: 'black' },
	tab: { background: { active: '#252525', inactive: 'transparent' } },
	button: {
		border: 'rgb(255 255 255 / 10%)',
		fill: '#252525',
		fillHover: '#2B2A2A',
		background: 'linear-gradient(180deg, #282727 0%, #191818 100%)',
		hover: 'linear-gradient(180deg, #383838 0%, #383838 0.01%, #1E1E1E 100%)',
		shadow:
			'rgb(0 0 0 / 25%) 0px 2px 2px, rgb(255 255 255 / 10%) 0px 1px 0px inset, rgb(255 255 255 / 3%) 0px 0px 20px inset',
		text: common.primaryWhite,
		primary: {
			background: 'linear-gradient(180deg, #BE9461 0%, #9C6C3C 100%)',
			hover: 'linear-gradient(180deg, #E4B378 0%, #B98C55 100%)',
			textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
		},
		secondary: { text: '#E4B378' },
		danger: { text: '#EF6868' },
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
	},
	input: {
		background: '#151515',
		secondary: {
			background: '#0b0b0b',
		},
		placeholder: '#787878',
		shadow: '0px 0.5px 0px rgba(255, 255, 255, 0.08)',
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
		title: common.secondaryGray,
		value: common.primaryWhite,
		label: common.secondaryGray,
	},
	icon: {
		fill: '#787878',
		hover: '#ECE8E3',
	},
	openInterestBar: {
		border: '1px solid #2b2a2a',
	},
	modal: {
		background: '#252525',
	},
};

export default darkTheme;
