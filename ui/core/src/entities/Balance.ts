import invariant from "tiny-invariant";
import _Big from "big.js";
import toFormat from "toformat";

import {
  BigintIsh,
  Fraction,
  parseBigintIsh,
  Rounding,
  TEN,
} from "./fraction/Fraction";
import JSBI from "jsbi";
import B from "./utils/B";
const Big = toFormat(_Big);

export class Balance extends Fraction {
  constructor(public decimals: number, public amount: BigintIsh) {
    super(
      parseBigintIsh(amount),
      JSBI.exponentiate(TEN, JSBI.BigInt(decimals))
    );
  }
  public toSignificant(
    significantDigits = this.decimals,
    format?: object,
    rounding: Rounding = Rounding.ROUND_DOWN
  ): string {
    return super.toSignificant(significantDigits, format, rounding);
  }

  public toFixed(
    decimalPlaces = this.decimals,
    format?: object,
    rounding: Rounding = Rounding.ROUND_DOWN
  ): string {
    invariant(decimalPlaces <= this.decimals, "DECIMALS");
    return super.toFixed(decimalPlaces, format, rounding);
  }

  public toExact(format: object = { groupSeparator: "" }): string {
    Big.DP = this.decimals;
    return new Big(this.numerator.toString())
      .div(this.denominator.toString())
      .toFormat(format);
  }
  static create(decimals: number, amount: BigintIsh): Balance {
    return new Balance(decimals, amount);
  }

  // Convenience method for initializing a balance with a number
  static n(decimals: number, amount: string | number) {
    return new Balance(decimals, B(amount, decimals));
  }
}
