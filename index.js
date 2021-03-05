const rdf = require('@rdfjs/data-model')

function getTypeIri (typeOrNode) {
  if (typeof typeOrNode === 'string') {
    return typeOrNode
  }

  if (typeOrNode.termType === 'NamedNode') {
    return typeOrNode.value
  }

  throw new Error('Unrecognized type to register. It must be string or rdf.NamedNode')
}

class LoaderRegistry {
  constructor () {
    this._literalLoaders = new Map()
    this._nodeLoaders = new Map()
  }

  registerLiteralLoader (type, loader) {
    this._literalLoaders.set(getTypeIri(type), loader)
  }

  registerNodeLoader (type, loader) {
    this._nodeLoaders.set(getTypeIri(type), loader)
  }

  load (node, options = {}) {
    const loader = this.loader(node)

    if (!loader) {
      return undefined
    }

    return loader(node, { ...options, loaderRegistry: this })
  }

  loader (node) {
    if (node.term.termType === 'Literal') {
      return this._literalLoaders.get(node.term.datatype.value)
    }

    const typeQuads = node.dataset.match(node.term, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))

    // loop over all type quads and assign the first found loader
    return [...typeQuads].reduce((loader, quad) => loader || this._nodeLoaders.get(quad.object.value), null)
  }
}

module.exports = LoaderRegistry
