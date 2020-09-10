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
	},
	data: {
		'title-small': `
			font-family: ${fontStyles.mono};
			font-size: 12px;
			line-height: 140%;
			letter-spacing: 0.2px;
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
