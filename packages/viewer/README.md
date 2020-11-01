# Very Nested Viewer

## 🔧 Tools

- [Typescript](https://www.typescriptlang.org/).
- [Microbundle](https://github.com/developit/microbundle) for bundling.
- [Storybook](https://github.com/storybookjs/presets/tree/master/packages/preset-create-react-app) with [Docs Addon](https://github.com/storybookjs/storybook/tree/master/addons/docs) for component developent and documentation.
- [Jest](https://create-react-app.dev/docs/running-tests/) for testing.

## 🔮 Future Development

- Try out my own rollup config when they fix this [typescript issue](https://github.com/rollup/plugins/issues/287).

## 💻 Running Locally

Install dependencies first.

```
yarn
```

Running Storybook

```
yarn storybook
```

Running tests.

```
yarn test
```

Build the package.

```
yarn build
```

Build the package continuously.

```
yarn build-watch
```
Deploy to npm.
```
npm publish
```

## Serialise current state

Select the storybook iframe in your console then run this.

```
console.log(JSON.stringify(window.store.getState().item, null, 1))
```
