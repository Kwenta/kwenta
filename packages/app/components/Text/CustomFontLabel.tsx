type Props = {
	text: string;
};

export const CustomFontLabel: React.FC<Props> = ({ text }) => {
	const chars = text.split('');

	return (
		<div>
			{chars.map((char, index) => {
				const isNumber = !isNaN(Number(char));
				const fontFamily = isNumber ? 'AkkuratMonoLLWeb-Regular' : 'AkkuratLLWeb-Regular';

				return (
					<span key={index} style={{ fontFamily }}>
						{char}
					</span>
				);
			})}
		</div>
	);
};
