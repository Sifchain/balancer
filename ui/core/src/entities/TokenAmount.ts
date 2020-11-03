import { Token } from "./Token";
import JSBI from "jsbi";
import { Balance } from "./Balance";
import { BigintIsh } from "./fraction/Fraction";

export class TokenAmount extends Balance {
  constructor(public asset: Token, public amount: BigintIsh) {
    super(asset, amount);
  }
}
