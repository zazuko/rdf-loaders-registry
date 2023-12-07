import { expect } from 'chai'
import rdf from '@zazuko/env'
import LoaderRegistry from '../index.js'

describe('LoaderRegistry', () => {
  let registry
  let node

  beforeEach(() => {
    registry = new LoaderRegistry()

    node = {
      term: rdf.namedNode(''),
      dataset: rdf.dataset(),
      graph: rdf.defaultGraph(),
    }
  })

  describe('registerLiteralLoader', () => {
    it('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader('http://example.com/code/ecmaScriptTemplate', loader)

      // then
      expect(registry._literalLoaders.size).to.eq(1)
    })

    it('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      expect(registry._literalLoaders.get('http://example.com/code/ecmaScript')).to.eq(loader)
    })

    it('throws an error if called with none string and named node parameter', () => {
      expect(() => {
        registry.registerLiteralLoader({}, {})
      }).to.throw()
    })
  })

  describe('registerNodeLoader', () => {
    it('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader('http://example.com/code/ecmaScript', loader)

      // then
      expect(registry._nodeLoaders.size).to.eq(1)
    })

    it('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      expect(registry._nodeLoaders.get('http://example.com/code/ecmaScript')).to.eq(loader)
    })

    it('throws an error if called with none string and named node parameter', () => {
      expect(() => {
        registry.registerNodeLoader({}, {})
      }).to.throw()
    })
  })

  describe('load', () => {
    it('should invoke found node loader', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/script')))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.eq('success')
    })

    it('should handle nodes with multiple types', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/scriptA', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/scriptA')))
      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/scriptB')))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.eq('success')
    })

    it('should invoke found literal loader', () => {
      // given
      const loader = () => 'success'
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.eq('success')
    })

    it('should return undefined if node loader is not found', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/other/type')))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.be.undefined
    })

    it('should return undefined if literal loader is not found', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/other/type'))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.be.undefined
    })

    it('loader is called with node argument', () => {
      // given
      const loader = node => node
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node)

      // then
      expect(result).to.eq(node)
    })

    it('loader is called with given options', () => {
      // given
      const options = { a: 'b' }
      const loader = (node, options) => options
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node, options)

      // then
      expect(result.a).to.eq('b')
    })

    it('loader is called with loaderRegistry option', () => {
      // given
      const options = { a: 'b' }
      const loader = (node, options) => options
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node, options)

      // then
      expect(result.loaderRegistry).to.eq(registry)
    })
  })

  describe('loader', () => {
    it('should load node loader', () => {
      // given
      const loader = {}
      registry.registerNodeLoader('http://example.com/code/script', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/script')))

      // when
      const result = registry.loader(node)

      // then
      expect(result).to.eq(loader)
    })

    it('should handle nodes with multiple types', () => {
      // given
      const loader = {}
      registry.registerNodeLoader('http://example.com/code/scriptA', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/scriptA')))
      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/scriptB')))

      // when
      const result = registry.loader(node)

      // then
      expect(result).to.eq(loader)
    })

    it('should load literal loader', () => {
      // given
      const loader = {}
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.loader(node)

      // then
      expect(result).to.eq(loader)
    })

    it('should return null if node loader is not found', () => {
      // given
      const loader = {}
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.dataset.add(rdf.quad(
        node.term,
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://example.com/code/other/type')))

      // when
      const result = registry.loader(node)

      // then
      expect(result).not.to.be.ok
    })

    it('should return null if literal loader is not found', () => {
      // given
      const loader = {}
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/other/type'))

      // when
      const result = registry.loader(node)

      // then
      expect(result).not.to.be.ok
    })
  })
})
