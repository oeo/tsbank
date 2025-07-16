/**
 * @file Entity.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { Entity } from '../../src/lib/Entity';

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

class AnotherTestEntity extends Entity<number> {
    constructor(id: number) {
        super(id);
    }
}

describe('Entity', () => {
  it('should have an id', () => {
    const entity = new TestEntity('test-id');
    expect(entity.id).toBe('test-id');
  });

  it('should be equal to another entity with the same id', () => {
    const entity1 = new TestEntity('test-id');
    const entity2 = new TestEntity('test-id');
    expect(entity1.equals(entity2)).toBe(true);
  });

  it('should not be equal to another entity with a different id', () => {
    const entity1 = new TestEntity('test-id-1');
    const entity2 = new TestEntity('test-id-2');
    expect(entity1.equals(entity2)).toBe(false);
  });

  it('should not be equal to a different type of entity', () => {
    const entity1 = new TestEntity('123');
    const entity2 = new AnotherTestEntity(123);
    // @ts-expect-error
    expect(entity1.equals(entity2)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const entity = new TestEntity('test-id');
    expect(entity.equals(undefined)).toBe(false);
  });

  it('should be equal to itself', () => {
    const entity = new TestEntity('test-id');
    expect(entity.equals(entity)).toBe(true);
  });
}); 