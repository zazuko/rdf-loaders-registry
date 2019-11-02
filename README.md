# Load native code based on RDF descriptions

This package implements a loader registry, which can be used to load code declared in RDF triples.

The registry cannot really do anything on its own. You will need actual loaders. One package which provides them is 
[rdf-loader-code](https://github.com/zazuko/rdf-loader-code) which lets you load JavaScript code.

## Installation

Installed from git for the time being

```
npm i --save https://github.com/zazuko/rdf-loaders-registry
```

## Usage

1. Import and create the registry
1. Register a loader to handle a specific 'rdf:type' or `rdf:datatype`
1. Call the `load` method

```js
const LoaderRegistry = require('rdf-loaders-registry')
const loader = require('./lolcode-loader')

const registry = new LoaderRegistry()

// register to load `<> a <http://example.com/Lolcode>`
registry.registerNodeLoader('http://example.com/Lolcode', loader)

// register to load `"some code"^^<http://example.com/LolcodeInline>`
registry.registerLiteralLoader('http://example.com/LolcodeInline', loader)

// somewhere else in code
registry.load(node, {
  // some additional options
})
```

The first parameter of `register` can also be an `@rdfjs/data-model` IRI term.

## Implementing a loader

A loader is a function which implements the following signature:

```typescript
(
  node: { term, dataset, graph }, 
  {
    loaderRegistry: LoaderRegistry,
    ...
  }
) => any
```

It is possible to combine multiple loaders by recursively calling `loaderRegistry.load` from the loader code.

## Example

The examples folder contains a simple example based on nebular data.
It shows how to implement both types of loaders, nested loaders and how to use the registry.
You can run the example with the following command:

```
node examples/ngc2392.js
```
