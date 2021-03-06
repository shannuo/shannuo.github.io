17. Letter Combinations of a Phone Number
Medium

2062

285

Favorite

Share
Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.

A mapping of digit to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.



Example:

Input: "23"
Output: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"].
Note:

Although the above answer is in lexicographical order, your answer could be in any order you want.

给定包含2-9（含）的数字的字符串，返回该数字可能表示的所有可能的字母组合。 下面给出了数字到字母的映射（就像在电话按钮上一样）。请注意，1不会映射到任何字母

/**
 * @param {string} digits
 * @return {string[]}
 */


function TreeNode(val, child = null) {
    this.val = val;
    this.child = this.child;
}

const data = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];

function buildTree(level, val, childValues) {
  const tree = new TreeNode(val, null);

  tree.child = childValues[level].map(childValue => new TreeNode(level - 1, childValue, childValues));

  return tree;
}

var letterCombinations = function(digits) {
  const arr = digits.split('');

  const childValues = arr.map(str => data[Number(str)]);

  const tree = buildTree(arr.length, '*', childValues);

  console.log(tree);
};

70元 买3、5、7、11元的书有多少种组合
const prices = [3, 5, 7, 11];

function buyBook(n) {
  const result = [];
  getPlan([], result, n);
  return result;
}

function getPlan(arr, result, n) {
  let used = 0;
  for (let i = 0; i < arr.length; i++) {
    used += prices[i] * arr[i];
  }
  console.log(used, arr);
  const max = n - used;

  if (max === 0) {
    return arr;
  }

  if (max < 0 || arr.length === n) {
    return false;
  }
  // console.log(arr, used);

  for (let i = 0; i < (max / prices[arr.length] + 1); i++) {
    const next = getPlan([...arr, i], result, n);
    if (next) {
      result.push(next);
    }
  }
}