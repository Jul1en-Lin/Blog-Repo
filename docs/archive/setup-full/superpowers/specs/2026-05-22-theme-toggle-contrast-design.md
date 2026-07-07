# Theme Toggle Contrast Design

## Goal

Raise the default perceived brightness of the header theme-toggle icon so the sun and moon read with the same visual weight as the neighboring GitHub and Instagram icons.

## Scope

- Adjust only project-level header styling.
- Keep the existing theme-toggle markup and SVG icon assets.
- Preserve current hover and focus behavior.
- Check the result in both light and dark color schemes.

## Approach

Use a selector scoped to `#dark-mode-toggle.theme-toggle` in the header stylesheet to override its default icon color with a stronger value than the shared action baseline. The social links keep their current color treatment, while the theme toggle gets the extra brightness needed for its thinner sun and moon strokes.

## Non-goals

- Do not redesign the header action group.
- Do not change GitHub or Instagram icon styling.
- Do not resize, replace, or redraw the theme SVG icons unless the scoped color correction fails.

## Verification

- Build the Hugo site with the repository verification command.
- Inspect the header in light mode and dark mode.
- Confirm the theme toggle still changes scheme, keeps its hover/focus lift, and does not shift header spacing.

