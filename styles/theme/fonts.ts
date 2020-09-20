const fontStyles = {
	regular: `AkkuratLLWeb-Regular`,
	bold: `AkkuratLLWeb-Bold`,
	mono: `AkkuratMonoLLWeb-Regular`,
};

export const fonts = {
	body: {
		'bold-small': `
			font-family: ${fontStyles.bold};
			font-size: 12px;
			font-weight: bold;
			line-height: 140%;
			letter-spacing: 0px;
		`,
		'bold-medium': `
			font-family: ${fontStyles.bold};
			font-size: 14px;
			font-weight: bold;
			line-height: 140%;
			letter-spacing: 0.2px;
		`,
		'thin-small': `
			font-family: ${fontStyles.regular};
			font-size: 12px;
			line-height: 140%;
			letter-spacing: 0px;
		`,
	},
	data: {
		small: `
			font-family: ${fontStyles.mono};
			font-size: 12px;
			font-weight: 500;
			line-height: 140%;
			letter-spacing: 0.2px;
		`,
		large: `
			font-family: ${fontStyles.mono};
			font-size: 16px;
			line-height: 140%;
			letter-spacing: 0.2px;
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
			line-height: 140%;
		`,
	},
};

export default fontStyles;
