# Very Nested

Infinitely nested lists published on GitHub.

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

### Template Development

1. Build the Viewer
1. add this script tag to the template.

   ```
   <script
         src="../viewer/dist/index.umd.js"
         crossorigin
       ></script>
   ```

1. Run `serve` in the root.
1. Go to this url: [http://localhost:5000/packages/template/](http://localhost:5000/packages/template/)

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
  - Originally I just made the versions mismatched but settled on adding an empty eslintrc to disable linting.
- To get netlify to build all the packages in the monorepo, I had to change the build command to cd to the root then cd back down to build the package.
  - There's still some weird stuff happening with regards to netlify dev on this one, see this ticket for more: https://github.com/netlify/cli/issues/859
