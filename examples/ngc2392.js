const cf = require('clownface')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const LoaderRegistry = require('..')

const ns = {
  example: namespace('http://example.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

function integerLoader (term) {
  return parseInt(term.value)
}

async function nebulaLoader (term, dataset, { loaderRegistry }){
  const node = cf(dataset, term)

  return {
    label: node.out(ns.example.label).value,
    distance: await loaderRegistry.load(node.out(ns.example.distance))
  }
}

async function main () {
  const registry = new LoaderRegistry()

  registry.registerLiteralLoader(ns.xsd.integer, integerLoader)
  registry.registerNodeLoader(ns.example.Nebula, nebulaLoader)

  const ngc2392 = cf(rdf.dataset(), ns.example('ngc/2392'))
  ngc2392.addOut(ns.rdf.type, ns.example.Nebula)
  ngc2392.addOut(ns.example.label, rdf.literal('Clownface Nebula'))
  ngc2392.addOut(ns.example.distance, rdf.literal('2870', ns.xsd.integer))

  // should return an object with a label and distance property
  const result = await registry.load(ngc2392)

  console.log(result)
}

main()
