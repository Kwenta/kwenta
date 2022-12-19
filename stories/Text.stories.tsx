import * as Text from 'components/Text';

export default {
	title: 'Components/Text',
	component: Text.Body,
};

export const BigText = () => {
	return (
		<div>
			<Text.BigText>Simple big text</Text.BigText>
			<Text.BigText mono>Mono big text</Text.BigText>
			<Text.BigText yellow mono kwenta>
				With Kwenta logo
			</Text.BigText>
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
