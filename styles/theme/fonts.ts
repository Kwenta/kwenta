const fontStyles = {
	regular: `AkkuratLLWeb-Regular`,
	bold: `AkkuratLLWeb-Bold`,
	mono: `AkkuratMonoLLWeb-Regular`,
};

export const fonts = {
	body: {
		boldSmall: `
			font-family: ${fontStyles.bold};
			font-size: 12px;
		`,
		boldMedium: `
			font-family: ${fontStyles.bold};
			font-size: 14px;
		`,
		thinSmall: `
			font-family: ${fontStyles.regular};
			font-size: 12px;
		`,
	},
	data: {
		small: `
			font-family: ${fontStyles.mono};
			font-size: 12px;
		`,
		large: `
			font-family: ${fontStyles.mono};
			font-size: 16px;
		`,
		xLarge: `
			font-family: ${fontStyles.mono};
			font-size: 20px;
		`,
	},
	heading: {
		h4: `
			font-family: ${fontStyles.regular};
			font-size: 20px;
		`,
	},
};

export default fontStyles;
