const cf = require('clownface')
const namespace = require('@rdfjs/namespace')
const rdf = { ...require('@rdfjs/data-model'), ...require('@rdfjs/dataset') }
const LoaderRegistry = require('..')

const ns = {
  example: namespace('http://example.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

// Literal loader that simple converts the value of the Literal using parseInt
function integerLoader (node) {
  return parseInt(node.term.value)
}

// Node loader that creates a nebular object (label, distance) using nested loaders
async function nebulaLoader (node, { loaderRegistry }) {
  const cfNode = cf(node)

  return {
    label: cfNode.out(ns.example.label).value,
    distance: await loaderRegistry.load(cfNode.out(ns.example.distance))
  }
}

async function main () {
  // create the registry...
  const registry = new LoaderRegistry()

  // ...and register the loaders
  registry.registerLiteralLoader(ns.xsd.integer, integerLoader)
  registry.registerNodeLoader(ns.example.Nebula, nebulaLoader)

  // create the quads for the nebular object
  const ngc2392 = cf({ term: ns.example('ngc/2392'), dataset: rdf.dataset() })
  ngc2392.addOut(ns.rdf.type, ns.example.Nebula)
  ngc2392.addOut(ns.example.label, rdf.literal('Clownface Nebula'))
  ngc2392.addOut(ns.example.distance, rdf.literal('2870', ns.xsd.integer))

  // use the loader to convert the quads to a nebular object with a label and distance property
  const result = await registry.load(ngc2392)

  console.log(result)
}

main()
