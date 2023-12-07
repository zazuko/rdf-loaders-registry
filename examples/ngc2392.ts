import rdf from '@zazuko/env'
import type { GraphPointer } from 'clownface'
import LoaderRegistry from '../index.js'

const ns = {
  example: rdf.namespace('http://example.org/'),
}

// Literal loader that simple converts the value of the Literal using parseInt
function integerLoader(node: GraphPointer) {
  return parseInt(node.term.value)
}

// Node loader that creates a nebular object (label, distance) using nested loaders
async function nebulaLoader(node: GraphPointer, { loaderRegistry }: { loaderRegistry: LoaderRegistry }) {
  const cfNode = rdf.clownface(node)
  const distance = cfNode.out(ns.example.distance) as GraphPointer

  return {
    label: cfNode.out(ns.example.label).value,
    distance: await loaderRegistry.load(distance),
  }
}

async function main() {
  // create the registry...
  const registry = new LoaderRegistry()

  // ...and register the loaders
  registry.registerLiteralLoader(rdf.ns.xsd.integer, integerLoader)
  registry.registerNodeLoader(ns.example.Nebula, nebulaLoader)

  // create the quads for the nebular object
  const ngc2392 = rdf.clownface({ term: ns.example('ngc/2392'), dataset: rdf.dataset() })
  ngc2392.addOut(rdf.ns.rdf.type, ns.example.Nebula)
  ngc2392.addOut(ns.example.label, rdf.literal('Clownface Nebula'))
  ngc2392.addOut(ns.example.distance, rdf.literal('2870', rdf.ns.xsd.integer))

  // use the loader to convert the quads to a nebular object with a label and distance property
  const result = await registry.load(ngc2392)

  console.log(result)
}

main()
