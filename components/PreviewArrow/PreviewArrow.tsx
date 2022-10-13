import styled from 'styled-components';

type TextColor = 'yellow' | 'red';

type PreviewArrowProps = {
	color?: TextColor;
	showPreview: boolean;
};

const PreviewArrow: React.FC<PreviewArrowProps> = ({ showPreview, children, color }) => {
	return showPreview ? (
		<>
			<StyledArrow />
			<StyledPreviewGold color={color}>{children}</StyledPreviewGold>
		</>
	) : null;
};

const StyledArrow = styled.span`
	::before {
		content: '➞';
		color: ${(props) => props.theme.colors.common.secondaryGray};
		font-size: 13px;
		padding: 0px 3px;
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

const StyledPreviewGold = styled.span<{ color?: TextColor }>`
	color: ${(props) => props.theme.colors.selectedTheme[props.color || 'yellow']};
`;

export default PreviewArrow;
