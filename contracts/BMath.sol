// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.5.12;

import "./BNum.sol";

contract BMath is BConst, BNum {

    struct Record {
        bool bound;   // is token bound to pool
        uint index;   // private
        uint balance;
    }

    /**********************************************************************************************
    //                                                                                           //
    // sP = spotPrice                       bI                                                   //
    // bI = tokenBalanceIn          sP =  ------                                                 //
    // bO = tokenBalanceOut                 bO                                                   //
    //                                                                                           //
    **********************************************************************************************/
    function calcSpotPrice(
        uint tokenBalanceIn,
        uint tokenBalanceOut
    )
        public pure
        returns (uint spotPrice)
    {
        uint sP = bdiv(tokenBalanceIn, tokenBalanceOut);
        return (spotPrice = sP);
    }

    /**********************************************************************************************
    //                                                                                           //
    // aO = tokenAmountOut                                                                       //
    // bO = tokenBalanceOut             /      /            bI             \   \                 //
    // bI = tokenBalanceIn   aO = bO * |  1 - | --------------------------  |   |                //
    // aI = tokenAmountIn               \      \          bI + aI          /   /                 //
    //                                                                                           //
    **********************************************************************************************/
    function calcOutGivenIn(
        uint tokenBalanceIn,
        uint tokenBalanceOut,
        uint tokenAmountIn
    )
        internal pure
        returns (uint tokenAmountOut)
    {
        uint adjustedIn = tokenAmountIn * BONE_DIFF;
        uint delta = bdiv(tokenBalanceIn, badd(tokenBalanceIn, adjustedIn));
        uint coeff = bsub(BONE, delta);
        tokenAmountOut = bmul(tokenBalanceOut, coeff);
        return tokenAmountOut;
    }
}
