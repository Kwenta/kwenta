import { ThemeInterface } from 'styles/theme';

declare module 'styled-components' {
	interface DefaultTheme extends ThemeInterface {}
}
