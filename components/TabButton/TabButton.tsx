import styled from 'styled-components';
import { fonts } from 'styles/theme/fonts';
const TabButton = styled.button<{ active: boolean; onClick: () => void }>`
    ${fonts.body['bold-small']}
    background-color: ${(props) => props.theme.colors.black};
    color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.blueberry)};
    outline: none;
    border: none;
    cursor: pointer;
    border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.colors.purple}` : 'none')};
`;

export default TabButton;
