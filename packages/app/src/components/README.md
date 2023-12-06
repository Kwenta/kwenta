# Kwenta Components

This folder contains all the base components that are used across the Kwenta interface. We try to ensure that they remain in sync will our latest designs. Components here have a number of props that cover every use case that is consistent with our design system.

Most of the components in this folder are viewable in our [Storybook]().

## Folder Structure

We try to ensure that folders are as flat as (reasonably) possible. For this, reason, most individual components can be found under `{component-name}.tsx`. However in the future, some domain specific components may be found in subfolders like `mobile`, `futures` or `exchange`. The components are only expected to be used in the context of the folders in which they are contained.

## Checklist

This list tracks features needed to complete the component refactor, as well as any component-related issues noticed with the current UI. This will help us get closer to a standard UI.

- [ ] Create primary, secondary and tertiary colors for both body text and headings. Make sure that designs conform to them and add them to the theme file.
- [ ] Create a component that takes in a wei value and returns the number with either a red, green or neutral color, depending on whether the value is positive, negative, zero or overridden.
- [x] Make the `InfoBox` (and similar components) more composable, rather than prop-driven, to ensure that render performance does not suffer.
- [ ] Complete Button component: Align completely with designs and figure out way to get rid of standalone `TabButton` component
- [ ] Decide whether or not it makes sense to completely decouple futures components from data requirements to make them Storybook compatible
- [ ] Finally crack down on styled components in the frontend. We should reduce the number of styled components by at least 60% to consider the refactor a success.
- [ ] Enforce uniform spacing between UI components. Consider adding a margin prop to most UI components (will also help get rid of most styled components).
- [ ] Make theme files contain everything that pertains to component variants and their different styles.
- [ ] Upgrade `react-table` to `@tanstack/react-table`. It's more recent and has better typing. We'll have to do a little bit of work though, to deal with breaking changes between the versions and make sure we improve on the render performance of the `Table` component.
- [ ] Finish implementing the `Text.Display` component.
- [ ] Do a pass through of all text-related components in the codebase, and make sure they use the new components. Also, add new props for use cases that aren't covered with the current implementation.
- [ ] Consider making `value` prop on `NumericValue` optional.
- [ ] Completely restructure the `ProfitCalculator` component.
- [ ] Add reusable `Label` component under `Text`. It should also support tooltip descriptions.

## Guidelines

- [ ] Avoid using `Styled` as a prefix to the names of styled components. Instead, prefer names that describe the function of the component. This makes it easier to understand the component's function at first glance. It also makes it easier to refactor or replace the component when necessary.
- [ ] Avoid using absolute positioning unless necessary. This helps avoid z-index conflicts and makes it easier for components to be adapted to multiple screen sizes.
