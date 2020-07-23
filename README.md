# Mini-App

This app exercises the usage of CRDTs on the client-side with very simple examples.


## Build

You need an installation of the `npm` JavaScript package manager.

- The CRDT library is installed from our Gitlab repository. Please ensure that you registered on Gitlab with your SSH key to pull the code more easily.
- The `browserify` packages bundles all npm modules required such that you only need to include the bundle in the html page using one `<script>` tag.
- Further, the `typescript` package allows to transpile Typescript code to JavaScript.

The different steps for transpiling and bundling are combined in one build script:

```
$ npm run-script build-tsc
```


## Running the Mini-App

Open `dist/index.html` in a browser of your choice (preferably Google Chrome which has great support for debugging).