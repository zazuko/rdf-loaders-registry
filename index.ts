/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import type { NamedNode } from '@rdfjs/types'
import rdf from '@rdfjs/data-model'
import type { GraphPointer } from 'clownface'
import { isLiteral } from 'is-graph-pointer'

type LoadOptions<T extends Record<string, unknown> = {}> = T & {
  // eslint-disable-next-line no-use-before-define
  loaderRegistry: LoaderRegistry
};

export interface Loader<T, TOptions extends Record<string, unknown> = {}> {
  (node: GraphPointer, options: LoadOptions<TOptions>): T | Promise<T>
}

export interface LoaderRegistry {
  registerLiteralLoader(datatype: NamedNode | string, loader: Loader<any, any>): void
  registerNodeLoader(type: NamedNode | string, loader: Loader<any, any>): void
  load<
    T = any,
    // eslint-disable-next-line no-use-before-define
    TLoader extends Loader<T, TOptions> = Loader<T>,
    TOptions extends Record<string, any> = TLoader extends Loader<T, infer U> ? U : {},
  >(node: GraphPointer, options?: TOptions): Promise<T> | T | undefined
  loader(node: GraphPointer): Loader<any, any> | null | undefined
}

function getTypeIri(typeOrNode: string | NamedNode) {
  if (typeof typeOrNode === 'string') {
    return typeOrNode
  }

  if (typeOrNode.termType === 'NamedNode') {
    return typeOrNode.value
  }

  throw new Error('Unrecognized type to register. It must be string or rdf.NamedNode')
}

export default class implements LoaderRegistry {
  public readonly _literalLoaders: Map<string, Loader<any, any>>
  public readonly _nodeLoaders: Map<string, Loader<any, any>>

  constructor() {
    this._literalLoaders = new Map()
    this._nodeLoaders = new Map()
  }

  registerLiteralLoader(datatype: NamedNode | string, loader: Loader<any, any>) {
    this._literalLoaders.set(getTypeIri(datatype), loader)
  }

  registerNodeLoader(type: NamedNode | string, loader: Loader<any, any>) {
    this._nodeLoaders.set(getTypeIri(type), loader)
  }

  load<
    T = any,
    // eslint-disable-next-line no-use-before-define
    TLoader extends Loader<T, TOptions> = Loader<T>,
    TOptions extends Record<string, any> = TLoader extends Loader<T, infer U> ? U : {},
  >(node: GraphPointer, options = {}): Promise<T> | T | undefined {
    const loader = this.loader(node)

    if (!loader) {
      return undefined
    }

    return loader(node, { ...options, loaderRegistry: this })
  }

  loader(node: GraphPointer): Loader<any, any> | null | undefined {
    if (isLiteral(node)) {
      return this._literalLoaders.get(node.term.datatype.value)
    }

    const typeQuads = node.dataset.match(node.term, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))

    // loop over all type quads and assign the first found loader
    return [...typeQuads].reduce<Loader<any, any> | null | undefined>((loader, quad) => loader || this._nodeLoaders.get(quad.object.value), null)
  }
}
