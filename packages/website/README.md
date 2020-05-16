# Very Nested Website

Made with gatsby and theme-ui.

Only issue is that Gatsby transpiles local modules and fails with very-nested-viewer because eslint is not happy with the minified production build. The workaround is to increment the very-nested-viewer version while developing so yarn pulls the npm version of very-nested-viewer so Gatsby won't transpile it.
