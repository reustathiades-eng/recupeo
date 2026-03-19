import { pii, percentage, url } from '../types'

describe('mapaie/types', () => {
  describe('pii()', () => {
    it('wraps a string value', () => {
      const result = pii('Jean Dupont')
      expect(result).toBe('Jean Dupont')
    })

    it('wraps a number value', () => {
      const result = pii(12345)
      expect(result).toBe(12345)
    })

    it('wraps a siret string', () => {
      const result = pii('83214768200015')
      expect(result).toBe('83214768200015')
    })
  })

  describe('percentage()', () => {
    it('accepts 0', () => {
      expect(percentage(0)).toBe(0)
    })

    it('accepts 1', () => {
      expect(percentage(1)).toBe(1)
    })

    it('accepts 0.87 (confidence score)', () => {
      expect(percentage(0.87)).toBe(0.87)
    })

    it('accepts 0.5', () => {
      expect(percentage(0.5)).toBe(0.5)
    })

    it('throws RangeError for value > 1', () => {
      expect(() => percentage(1.01)).toThrow(RangeError)
      expect(() => percentage(1.01)).toThrow('Percentage must be between 0 and 1, got 1.01')
    })

    it('throws RangeError for negative value', () => {
      expect(() => percentage(-0.1)).toThrow(RangeError)
      expect(() => percentage(-0.1)).toThrow('Percentage must be between 0 and 1, got -0.1')
    })

    it('throws RangeError for value 2', () => {
      expect(() => percentage(2)).toThrow(RangeError)
    })
  })

  describe('url()', () => {
    it('accepts a valid https URL', () => {
      const value = 'https://recupeo.fr/rapport/abc123'
      expect(url(value)).toBe(value)
    })

    it('accepts a valid http URL', () => {
      const value = 'http://api.recupeo.fr/audit/42'
      expect(url(value)).toBe(value)
    })

    it('throws TypeError for an invalid URL', () => {
      expect(() => url('not-a-url')).toThrow(TypeError)
      expect(() => url('not-a-url')).toThrow('Invalid URL: not-a-url')
    })

    it('throws TypeError for empty string', () => {
      expect(() => url('')).toThrow(TypeError)
    })

    it('throws TypeError for missing protocol', () => {
      expect(() => url('recupeo.fr/rapport')).toThrow(TypeError)
    })
  })
})