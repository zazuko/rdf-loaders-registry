/* global beforeEach, describe, expect, test  */

const rdf = { ...require('@rdfjs/data-model'), ...require('@rdfjs/dataset') }
const LoaderRegistry = require('..')

describe('LoaderRegistry', () => {
  let registry
  let node

  beforeEach(() => {
    registry = new LoaderRegistry()

    node = {
      term: rdf.namedNode(''),
      dataset: rdf.dataset(),
      graph: rdf.defaultGraph()
    }
  })

  describe('registerLiteralLoader', () => {
    test('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader('http://example.com/code/ecmaScriptTemplate', loader)

      // then
      expect(registry._literalLoaders.size).toBe(1)
    })

    test('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      expect(registry._literalLoaders.get('http://example.com/code/ecmaScript')).toBe(loader)
    })

    test('throws an error if called with none string and named node parameter', () => {
      expect(() => {
        registry.registerLiteralLoader({}, {})
      }).toThrow()
    })
  })

  describe('registerNodeLoader', () => {
    test('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader('http://example.com/code/ecmaScript', loader)

      // then
      expect(registry._nodeLoaders.size).toBe(1)
    })

    test('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      expect(registry._nodeLoaders.get('http://example.com/code/ecmaScript')).toBe(loader)
    })

    test('throws an error if called with none string and named node parameter', () => {
      expect(() => {
        registry.registerNodeLoader({}, {})
      }).toThrow()
    })
  })

  describe('load', () => {
    test('should invoke found node loader', () => {
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
      expect(result).toBe('success')
    })

    test('should handle nodes with multiple types', () => {
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
      expect(result).toBe('success')
    })

    test('should invoke found literal loader', () => {
      // given
      const loader = () => 'success'
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node)

      // then
      expect(result).toBe('success')
    })

    test('should return undefined if node loader is not found', () => {
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
      expect(result).toBeUndefined()
    })

    test('should return undefined if literal loader is not found', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/other/type'))

      // when
      const result = registry.load(node)

      // then
      expect(result).toBeUndefined()
    })

    test('loader is called with node argument', () => {
      // given
      const loader = node => node
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node)

      // then
      expect(result).toBe(node)
    })

    test('loader is called with given options', () => {
      // given
      const options = { a: 'b' }
      const loader = (node, options) => options
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node, options)

      // then
      expect(result.a).toBe('b')
    })

    test('loader is called with loaderRegistry option', () => {
      // given
      const options = { a: 'b' }
      const loader = (node, options) => options
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.load(node, options)

      // then
      expect(result.loaderRegistry).toBe(registry)
    })
  })

  describe('loader', () => {
    test('should load node loader', () => {
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
      expect(result).toBe(loader)
    })

    test('should handle nodes with multiple types', () => {
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
      expect(result).toBe(loader)
    })

    test('should load literal loader', () => {
      // given
      const loader = {}
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/code/script'))

      // when
      const result = registry.loader(node)

      // then
      expect(result).toBe(loader)
    })

    test('should return null if node loader is not found', () => {
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
      expect(result).toBeFalsy()
    })

    test('should return null if literal loader is not found', () => {
      // given
      const loader = {}
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      node.term = rdf.literal('test', rdf.namedNode('http://example.com/other/type'))

      // when
      const result = registry.loader(node)

      // then
      expect(result).toBeFalsy()
    })
  })
})
