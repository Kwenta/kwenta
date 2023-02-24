# Kwenta Sections

## Folder Structure

- earn
- exchange
- dashboard
- futures
- leaderboard

## Guidelines

We are currently working on making this folder easier to navigate and contribute to. For this reason, there are a number of guidelines we are following closely. Please note that contributions will not be accepted unless they follow them closely as well:

- Don't use a folder, unless absolutely necessary. Prefer `{FeatureName}.tsx` over `{FeatureName}/index.tsx`. Only use the latter when there are other components necessary to make `{FeatureName}` complete, but do not classify as base components or standalone sections.
- Don't create a styled component unless absolutely necessary. We're currently revamping the component library, to make it more feature-rich. This will enable us to create new features without having to create very specific components.
- Any instance of `eslint-disable-next-line react-hooks/exhaustive-deps` should be treated as a bug.
