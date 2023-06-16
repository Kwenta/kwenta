import common from './common';
import darkTheme from './dark';
import lightTheme from './light';

const goldColors = {
	color1: '#BE9461',
	color2: '#9C6C3C',
	color3: '#E4B378',
	color4: '#B98C55',
};

export const themeColors = {
	dark: darkTheme,
	light: lightTheme,
};

const colors = {
	black: '#000000',
	silver: '#8A939F',
	white: '#FFFFFF',
	red: '#CB366D',
	green: '#66DD84',
	yellow: '#FFDF6D',
	goldColors,
	gold: `linear-gradient(180deg, ${goldColors.color1} 0%, ${goldColors.color2} 100%)`,
	// network colors
	mainnet: '#29B6AF',
	ropsten: '#FF4A8D',
	kovan: '#7057FF',
	rinkeby: '#F6C343',
	optimism: '#7FD482',
	goerli: 'rgb(48, 153, 242)',
	connectedDefault: goldColors.color1,
	noNetwork: '#EF6868',
	common,
};

export default colors;
