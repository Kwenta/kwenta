import { useState, useEffect } from 'react';
import styled from 'styled-components';

type PreviewArrowProps = {
	showPreview: boolean;
};

const PreviewArrow: React.FC<PreviewArrowProps> = ({ showPreview, children }) => {
	const [showPotentialTrade, setShowPotentialTrade] = useState(false);

	useEffect(() => {
		if (showPreview) {
			setShowPotentialTrade(true);
		} else {
			setShowPotentialTrade(false);
		}
	}, [showPreview]);

	return showPotentialTrade ? (
		<>
			<StyledArrow />
			<StyledPreviewGold>{children}</StyledPreviewGold>
		</>
	) : null;
};

const StyledArrow = styled.span`
	::before {
		content: '➞';
		color: ${(props) => props.theme.colors.common.secondaryGray};
		font-size: 12px;
		padding: 0px 3px;
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

const StyledPreviewGold = styled.span`
	color: ${(props) => props.theme.colors.yellow};
`;

export default PreviewArrow;
