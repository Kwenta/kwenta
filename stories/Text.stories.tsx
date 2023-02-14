import Spacer from 'components/Spacer';
import * as Text from 'components/Text';

export default {
	title: 'Components/Text',
	component: Text.Body,
};

export const LogoText = () => {
	return (
		<div>
			<Text.LogoText>White logo text</Text.LogoText>
			<Text.LogoText yellow>White logo text</Text.LogoText>
		</div>
	);
};

export const Heading = () => {
	return (
		<div>
			<Text.Heading variant="h1">Heading 1</Text.Heading>
			<Text.Heading variant="h2">Heading 2</Text.Heading>
			<Text.Heading variant="h3">Heading 3</Text.Heading>
			<Text.Heading variant="h4">Heading 4</Text.Heading>
			<Text.Heading variant="h5">Heading 5</Text.Heading>
		</div>
	);
};

export const Body = () => {
	return (
		<div>
			<Text.Body>This is regular body text</Text.Body>
			<Text.Body size="medium">This is regular body text</Text.Body>
			<Text.Body size="large">This is regular body text</Text.Body>
			<Spacer height={8} />
			<Text.Body weight="bold">This is bold body text</Text.Body>
			<Text.Body size="medium" weight="bold">
				This is bold body text
			</Text.Body>
			<Text.Body size="large" weight="bold">
				This is bold body text
			</Text.Body>
			<Spacer height={8} />
			<Text.Body mono>This is monospaced body text</Text.Body>
			<Text.Body size="medium" mono>
				This is monospaced body text
			</Text.Body>
			<Text.Body size="large" mono>
				This is monospaced body text
			</Text.Body>
			<Spacer height={8} />
			<Text.Body mono weight="bold">
				This is bold monospaced body text
			</Text.Body>
			<Text.Body size="medium" mono weight="bold">
				This is bold monospaced body text
			</Text.Body>
			<Text.Body size="large" mono weight="bold">
				This is bold monospaced body text
			</Text.Body>
		</div>
	);
};

export const NumericValue = () => {};
