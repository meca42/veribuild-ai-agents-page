import { describe, it, expect } from 'vitest';
import { schemas } from '../validation';

describe('Tool Validation', () => {
  describe('search_drawings', () => {
    it('validates valid query', () => {
      const result = schemas.search_drawings.validate({ query: 'foundation' });
      expect(result.valid).toBe(true);
      expect(result.data?.query).toBe('foundation');
    });

    it('rejects empty query', () => {
      const result = schemas.search_drawings.validate({ query: '' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-empty');
    });

    it('rejects query over 120 chars', () => {
      const result = schemas.search_drawings.validate({ query: 'a'.repeat(121) });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('120 characters');
    });

    it('trims whitespace', () => {
      const result = schemas.search_drawings.validate({ query: '  test  ' });
      expect(result.valid).toBe(true);
      expect(result.data?.query).toBe('test');
    });
  });

  describe('query_inventory', () => {
    it('validates valid item', () => {
      const result = schemas.query_inventory.validate({ item: 'rebar' });
      expect(result.valid).toBe(true);
      expect(result.data?.item).toBe('rebar');
    });

    it('rejects empty item', () => {
      const result = schemas.query_inventory.validate({ item: '' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-empty');
    });

    it('rejects item over 120 chars', () => {
      const result = schemas.query_inventory.validate({ item: 'a'.repeat(121) });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('120 characters');
    });
  });

  describe('create_rfi', () => {
    it('validates valid RFI', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Foundation question',
        question: 'What is the depth requirement?',
      });
      expect(result.valid).toBe(true);
      expect(result.data?.subject).toBe('Foundation question');
      expect(result.data?.question).toBe('What is the depth requirement?');
    });

    it('rejects short subject', () => {
      const result = schemas.create_rfi.validate({
        subject: 'ab',
        question: 'Valid question',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('rejects subject over 140 chars', () => {
      const result = schemas.create_rfi.validate({
        subject: 'a'.repeat(141),
        question: 'Valid question',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('140 characters');
    });

    it('rejects short question', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Valid subject',
        question: 'test',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 5 characters');
    });

    it('rejects question over 4000 chars', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Valid subject',
        question: 'a'.repeat(4001),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('4000 characters');
    });

    it('accepts valid UUID for drawing_id', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Valid subject',
        question: 'Valid question',
        drawing_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.valid).toBe(true);
      expect(result.data?.drawing_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('rejects invalid UUID for drawing_id', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Valid subject',
        question: 'Valid question',
        drawing_id: 'not-a-uuid',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid UUID');
    });

    it('accepts null drawing_id', () => {
      const result = schemas.create_rfi.validate({
        subject: 'Valid subject',
        question: 'Valid question',
        drawing_id: null,
      });
      expect(result.valid).toBe(true);
      expect(result.data?.drawing_id).toBe(null);
    });
  });
});
