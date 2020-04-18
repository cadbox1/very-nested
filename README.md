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

## Graph Powered

Dry Notes looks like any other notes app but actually uses a graph data structure instead of a tree. That means a single note can exist in multiple places hence the name, [DRY (don't repeat yourself)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

That means we can have calculations to do clever things like managing tasks, but that's just the beginning.

You still write and edit notes as a tree because a tree is just one perspective of a graph. With Dry Notes you can record and explore the other perspectives of your notes.
