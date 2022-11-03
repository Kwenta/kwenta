import { useCallback, useState } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input/Input';
import Text from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';

import ELIGIBILITY_SET from './EligibilitySet';
import LONOCLAUSE_SET from './LonoClause';

const EligibilityBox = () => {
	const [address, setAddress] = useState('');
	const [isEligible, setIsEligible] = useState<boolean>();
	const [isLonoEligible, setIsLonoEligible] = useState<boolean>();

	const handleChangeAddress = useCallback((e) => {
		setAddress(e.target.value);
	}, []);

	const handleCheck = useCallback(() => {
		setIsEligible(!!(address && ELIGIBILITY_SET.has(address)));
		setIsLonoEligible(!!(address && LONOCLAUSE_SET.has(address)));
	}, [address]);

	return (
		<div style={{ maxWidth: '445px' }}>
			<EligibilitySectionTitle>SNX Staker & Synth Trader Distribution</EligibilitySectionTitle>
			<EligibilityContainer>
				<EligibilityText>Enter your wallet address to check eligibility</EligibilityText>
				<EligibilityInput placeholder="0x..." value={address} onChange={handleChangeAddress} />
				<Button fullWidth size="sm" onClick={handleCheck}>
					Check
				</Button>
			</EligibilityContainer>
			{isEligible !== undefined && !isLonoEligible && (
				<EligibilityStatus $isEligible={isEligible}>
					{isEligible ? (
						<span>
							Address is eligible for
							<StyledLink
								style={{ marginLeft: '5px' }}
								onClick={() => window.open(EXTERNAL_LINKS.Aelin.Pool)}
							>
								the Aelin pool (Nov 1 - Nov 14).
							</StyledLink>
						</span>
					) : (
						<span>Address is not eligible.</span>
					)}
				</EligibilityStatus>
			)}
			{isLonoEligible && (
				<EligibilityStatus $isEligible={true}>
					{`You'll get your allocation distributed directly as escrowed KWENTA at the launch of the token. No further action is needed.`}
				</EligibilityStatus>
			)}
		</div>
	);
};

const StyledLink = styled.span`
	cursor: pointer;
	font-weight: 700;
`;
const EligibilitySectionTitle = styled.div`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.selectedTheme.gold};
	font-family: ${(props) => props.theme.fonts.black};
`;

const EligibilityContainer = styled.div`
	margin-top: 8px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 6px;
	padding: 20px;
`;

const EligibilityText = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
`;

const EligibilityInput = styled(Input)`
	margin: 8px 0;
`;

const EligibilityStatus = styled.div<{ $isEligible: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;

	padding: 10px 10px;
	margin-top: 8px;

	border: 1px solid
		${(props) =>
			props.$isEligible
				? props.theme.colors.selectedTheme.green
				: props.theme.colors.selectedTheme.red};
	border-radius: 6px;
	color: ${(props) =>
		props.$isEligible
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
`;

export default EligibilityBox;
