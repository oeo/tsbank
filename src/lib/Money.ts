/**
 * @file Money.ts
 */

import { ValueObject } from './ValueObject';

interface MoneyProps {
  amount: number; // in cents
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * get amount
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * get currency
   */
  get currency(): string {
    return this.props.currency;
  }

  /**
   * create new money
   */
  public static create(amount: number, currency: string): Money {
    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code.');
    }
    // Convert to cents
    return new Money({ amount: Math.round(amount * 100), currency });
  }

  /**
   * create from props
   */
  public static from(props: MoneyProps): Money {
    return new Money(props);
  }

  /**
   * add funds
   */
  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies.');
    }
    return new Money({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  /**
   * subtract funds
   */
  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies.');
    }
    return new Money({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }
}
