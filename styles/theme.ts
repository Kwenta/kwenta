import { createMuiTheme } from '@material-ui/core/styles';

import colors from './colors';
import fonts from './fonts';

export const scTheme = {
	colors,
	fonts,
};

export type SCThemeInterface = typeof scTheme;

export const muiTheme = createMuiTheme({});
