/**
 * @file ValueObject.ts
 */

import { shallowEqual } from 'shallow-equal-object';

export abstract class ValueObject<T extends Record<string, any>> {
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
