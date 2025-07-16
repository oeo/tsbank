/**
 * @file ValueObject.test.ts
 */

// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { ValueObject } from '../../src/shared/ValueObject';
import { Money } from '../../src/shared/Money';

interface TestProps {
    foo: string;
    bar: number;
}

class TestValueObject extends ValueObject<TestProps> {
    constructor(props: TestProps) {
        super(props);
    }
}

describe('ValueObject', () => {
    it('should be equal to another value object with the same props', () => {
        const vo1 = new TestValueObject({ foo: 'hello', bar: 123 });
        const vo2 = new TestValueObject({ foo: 'hello', bar: 123 });
        expect(vo1.equals(vo2)).toBe(true);
    });

    it('should not be equal to another value object with different props', () => {
        const vo1 = new TestValueObject({ foo: 'hello', bar: 123 });
        const vo2 = new TestValueObject({ foo: 'world', bar: 456 });
        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should not be equal to null or undefined', () => {
        const vo = new TestValueObject({ foo: 'hello', bar: 123 });
        expect(vo.equals(null)).toBe(false);
        expect(vo.equals(undefined)).toBe(false);
    });
});

describe('Money', () => {
    it('should create money in cents', () => {
        const money = Money.create(10.50, 'USD');
        expect(money.amount).toBe(1050);
        expect(money.currency).toBe('USD');
    });

    it('should add two amounts of money', () => {
        const m1 = Money.create(10, 'USD');
        const m2 = Money.create(5, 'USD');
        const result = m1.add(m2);
        expect(result.amount).toBe(1500);
    });

    it('should subtract two amounts of money', () => {
        const m1 = Money.create(10, 'USD');
        const m2 = Money.create(5, 'USD');
        const result = m1.subtract(m2);
        expect(result.amount).toBe(500);
    });

    it('should throw an error when adding money of different currencies', () => {
        const m1 = Money.create(10, 'USD');
        const m2 = Money.create(5, 'EUR');
        expect(() => m1.add(m2)).toThrow('Cannot add money with different currencies.');
    });

    it('should throw an error for invalid currency code', () => {
        expect(() => Money.create(10, 'US')).toThrow('Currency must be a 3-letter ISO code.');
    });
}); 