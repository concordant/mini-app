# Mini-App

[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)

This app exercises the usage of CRDTs on the client-side with very simple examples.

## Build

You need an installation of the `npm` JavaScript package manager.

- The project uses the Concordant multiplatform library from [Concordant private registry](
https://gitlab.inria.fr/concordant/software/c-client#usage).
- The `browserify` packages bundles all npm modules required such that you only need to include the bundle in the html page using one `<script>` tag.
- Further, the `typescript` package allows to transpile Typescript code to JavaScript.

To install these packages use the following command:

```
$ npm install
```

The different steps for transpiling and bundling are combined in one build script:

```
$ npm run-script build-tsc
```

## Running the Mini-App

Open `dist/index.html` in a browser of your choice.
