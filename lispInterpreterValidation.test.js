import lisp from './lispInterpreter';

test('Detect undefined variable', () => {
  expect(() => lisp(`(+ x 1)`))
    .toThrow('Undefined variable: x');
});

test('Detect invalid function call', () => {
  expect(() => lisp(`(not 1 2)`))
    .toThrow('Invalid argument count for function: not');
});

test('Check for division by zero', () => {
  expect(() => lisp(`(/ 1 0)`))
    .toThrow('Division by zero');
});

test('Detect invalid syntax', () => {
  expect(() => lisp(`(+ 1)`))
    .not.toThrow(); // Valid single argument
  expect(() => lisp(`(+ )`))
    .toThrow('Invalid syntax: (+ )');
});

test('Ensure immutability of variables', () => {
  expect(() => lisp(`(begin (define x 10) (set! x 20))`))
    .toThrow('Cannot reassign variable: x');
});

test('Detect invalid parentheses nesting', () => {
  expect(() => lisp(`(begin (+ 1 2 (* 3 4))`))
    .toThrow('Mismatched parentheses');
});

test('Detect invalid function application', () => {
  expect(() => lisp(`(10 20)`))
    .toThrow('Invalid function call: 10 is not callable');
});

test('Handle large numbers', () => {
  expect(lisp(`(+ 1000000000000000 2000000000000000)`))
    .toEqual(3000000000000000);
});

test('Handle deeply nested expressions', () => {
  const nestedExpression = `(begin ${Array(1000).fill('(+ 1').join(' ')} 1 ${')'.repeat(1000)})`;
  expect(lisp(nestedExpression))
    .toEqual(1001);
});

test('Validate empty input', () => {
  expect(() => lisp(``))
    .toThrow('Input cannot be empty');
});

test('Detect unsupported operations', () => {
  expect(() => lisp(`(unknown-op 1 2)`))
    .toThrow('Unknown function: unknown-op');
});

test('Ensure proper handling of booleans in conditions', () => {
  expect(lisp(`(if #t 42 0)`))
    .toEqual(42);
  expect(lisp(`(if #f 42 0)`))
    .toEqual(0);
});

test('Check for invalid number of arguments', () => {
  expect(() => lisp(`(+ 1 2 3 4 5)`))
    .not.toThrow(); // Should handle multiple arguments
  expect(() => lisp(`(if)`))
    .toThrow('Invalid argument count for function: if');
});

test('Detect infinite recursion', () => {
  expect(() => lisp(`(begin (define loop (lambda () (loop))) (loop))`))
    .toThrow('Maximum call stack size exceeded');
});

test('Handle edge cases for comparison', () => {
  expect(lisp(`(< 1 2)`)).toEqual('#t');
  expect(lisp(`(< 2 2)`)).toEqual('#f');
  expect(lisp(`(<)`)).toThrow('Invalid argument count for function: <');
});
