import React from 'react';
import styled from 'styled-components';
import Button from 'components/Button';

const MobileWalletButton = () => {
	return <StyledButton mono>kwenta.eth</StyledButton>;
};

const StyledButton = styled(Button)`
	text-transform: none;
`;

export default MobileWalletButton;
