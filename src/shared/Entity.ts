/**
 * @file Entity.ts
 */

export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  /**
   * get entity id
   */
  get id(): T {
    return this._id;
  }

  /**
   * check for equality
   */
  equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }
} 