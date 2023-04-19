import styled from 'styled-components';

import { Body } from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';

import GitHashID from './GitHashID';
import OperationStatus from './OperationStatus';

const Footer = () => {
	return (
		<FooterContainer>
			<OperationStatus />
			<GitHashID />
			<RightContainer>
				<FooterLink href={EXTERNAL_LINKS.Docs.DocsRoot}>
					<Body color="secondary">Documentation</Body>
				</FooterLink>
				<FooterLink href={EXTERNAL_LINKS.Social.Discord}>
					<Body color="secondary">Support</Body>
				</FooterLink>
			</RightContainer>
		</FooterContainer>
	);
};

const FooterContainer = styled.footer`
	display: grid;
	z-index: 120;
	grid-template-columns: repeat(3, 1fr);
	align-items: center;
	padding: 10px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
`;

const RightContainer = styled.div`
	display: flex;
	justify-content: flex-end;
`;

const FooterLink = styled.a.attrs({ target: '_blank', rel: '_noreferrer' })`
	&:not(:last-of-type) {
		margin-right: 18px;
	}
`;

export default Footer;
