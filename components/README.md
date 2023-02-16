# Kwenta Components

## Folder Structure

## Checklist

This list tracks features needed to complete the component refactor, as well as any component-related issues noticed with the current UI. This will help us get closer to a standard UI.

- [ ] Create primary, secondary and tertiary colors for both body text and headings. Make sure that designs conform to them and add them to the theme file.
- [ ] Create component that takes in a wei value and returns the number with either a red, green or neutral color, depending on whether the value is positive, negative, zero or overridden.
- [ ] Make the `InfoBox` (and similar components) more composable, rather than prop-driven, to ensure that render performance does not suffer.
- [ ] Complete Button component: Align completely with designs and figure out way to get rid of standalone `TabButton` component
- [ ] Decide whether or not it makes sense to completely decouple futures components from data requirements to make them Storybook compatible
- [ ] Finally crack down on styled components in the frontend. We should reduce the number of styled components by at least 60% to consider the refactor a success.
- [ ] Enforce uniform spacing between UI components. Consider adding a margin prop to most UI components (will also help get rid of most styled components).
- [ ] Make theme files contain everything that pertains to component variants and their different styles.
