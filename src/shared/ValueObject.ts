/**
 * @file ValueObject.ts
 */

// @ts-expect-error
import { shallowEqual } from 'shallow-equal-object';

interface ValueObjectProps {
  [index: string]: unknown;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * check for equality
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return shallowEqual(this.props, vo.props);
  }
} 