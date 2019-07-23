const cf = require('clownface')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const LoaderRegistry = require('..')

const ns = {
  example: namespace('http://example.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

// Literal loader that simple converts the value of the Literal using parseInt
function integerLoader (term) {
  return parseInt(term.value)
}

// Node loader that creates a nebular object (label, distance) using nested loaders
async function nebulaLoader (term, dataset, { loaderRegistry }) {
  const node = cf(dataset, term)

  return {
    label: node.out(ns.example.label).value,
    distance: await loaderRegistry.load(node.out(ns.example.distance))
  }
}

async function main () {
  // create the registry...
  const registry = new LoaderRegistry()

  // ...and register the loaders
  registry.registerLiteralLoader(ns.xsd.integer, integerLoader)
  registry.registerNodeLoader(ns.example.Nebula, nebulaLoader)

  // create the quads for the nebular object
  const ngc2392 = cf(rdf.dataset(), ns.example('ngc/2392'))
  ngc2392.addOut(ns.rdf.type, ns.example.Nebula)
  ngc2392.addOut(ns.example.label, rdf.literal('Clownface Nebula'))
  ngc2392.addOut(ns.example.distance, rdf.literal('2870', ns.xsd.integer))

  // use the loader to convert the quads to a nebular object with a label and distance property
  const result = await registry.load(ngc2392)

  console.log(result)
}

main()
