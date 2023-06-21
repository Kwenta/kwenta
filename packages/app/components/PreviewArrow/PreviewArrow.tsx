import { ReactNode, memo } from 'react';
import styled from 'styled-components';

import { MiniLoader } from 'components/Loader';

type TextColor = 'yellow' | 'red';

type PreviewArrowProps = {
	children?: ReactNode;
	color?: TextColor;
	showPreview: boolean;
	loading?: boolean;
};

const PreviewArrow: React.FC<PreviewArrowProps> = memo(
	({ showPreview, children, color, loading }) => {
		return showPreview ? (
			<>
				<StyledArrow />
				<StyledPreviewGold color={color}>{loading ? <MiniLoader /> : children}</StyledPreviewGold>
			</>
		) : null;
	}
);

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
