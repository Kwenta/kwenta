import styled from 'styled-components';
import Text from 'components/Text';

export const CardTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
`;

export const ConvertContainer = styled.div`
	max-width: 1000px;
	margin: 0 auto;
	width: 100%;
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 14px;

	&:not(:first-of-type) {
		margin-top: 10px;
	}
`;
