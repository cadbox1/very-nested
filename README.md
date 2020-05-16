# Dry Notes

Data driven notes.

[Live Demo](https://notes.cadell.dev)

![Tasks Demo](./tasks-demo.gif)

## 💻 Running Locally

Install dependencies and run the initial build.

```
yarn
yarn prepare
```

### Manager Development

```
cd packages/manager
yarn start
```

### Viewer Development

You can use storybook to develop the Viewer in isolation.

```
cd packages/viewer
yarn storybook
```

You can also build it in watch mode, in another terminal, to have it reload in the Manager app.

```
cd packages/package-template
yarn build-watch
```

## Technical Problems Solved

- GitHub OAuth with Netlify Functions
  - This includes setting up Netlify Dev so we can develop functions locally
  - Would have been nice if GitHub supported the implicit flow so we didn't need any server side code.
  - The Netlify Functions OAuth examples included the initial auth request but this doesn't work with the popup flow (instead of a redirect flow where you lose page state) since you would get the url asynchronously where popups are blocked because they require user interaction.
    - This meant moving the url generation to the client side.
      - The pouplar OAuth library I used doesn't work in the browser.
      - Created the request myself with the queryString library.
- Redux structure
  - This is the 3rd rewrite of the structure for the redux code.
    1. Used the spread operator for immutable reducers
    2. Replaced those with Immer and wrote a weird, OOP style, translator that felt very weird.
    3. Replaced that with Redux Toolkit (which uses immer), typescript and removed the translator in favour of some functional style functions.
- Building the viewer library
  - Initially used microbundle, which uses rollup underneath, and that worked great with the CRA manager app.
  - The standalone viewer uses unpkg to load the viewer so I needed the umd build to bundle the dependencies, otherwise I would have to add them to the standalone viewer and that didn't sound so great.
  - Microbundle fails to bundle the React-Hotkeys dependency for something and it's something to do with rollup that I think they're working on.
    - Tried a lot of combinations here with Rollup directly but I think it's an issue they're working on.
  - Switched to webpack for the umd build and that worked great.
    - I still kept microbundle around because it can create the modern and efficient module build for the manager app wheras webpack can't yet.
- Gatsby transpiles workspace packages whereas CRA doesn't
  - Gatsby tries to transpile and lint the built module which fails because it's a production build.
  - The workaround here is to increment the version on the very-nested-viewer locally so yarn pulls the npm version and Gatsby doesn't transpile it.
