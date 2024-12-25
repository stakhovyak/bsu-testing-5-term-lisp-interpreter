export default lispString => evaluation(ast(lispString), globEnv)

let Env = {
  'constructor': function (prams = [], args = [], outer = null) {
    let env = Object.assign({}, this)
    for (let i = 0; i < prams.length; i++) {
      env[prams[i]] = args[i]
    }
    env.outer = outer
    return env
  },
  'find': function (variable) {
    return this[variable] ? this : this.outer.find(variable)
  }
}

const procedure = {
  'constructor': function (prams, body, env) {
    let proc = Object.assign({}, this)
    proc.prams = prams
    proc.body = body
    proc.env = env
    return proc
  },
  'call': function (obj, args) {
    return evaluation(this.body, Env.constructor(this.prams, args, this.env))
  }
}

let globEnv = {
  '+': args => args.map(x => {
    if (!Number(x)) throw Error(`+: number required, but got ${typeof x}`)
    return x
  }).reduce((x, y) => x + y),
  '-': args => args.map(x => {
    if (!Number(x)) throw Error(`-: number required, but got ${typeof x}`)
    return x
  }).reduce((x, y) => x - y),
  '*': args => args.map(x => {
    if (!Number(x)) throw Error(`*: number required, but got ${typeof x}`)
    return x
  }).reduce((x, y) => x * y),
  '/': args => args.map(x => {
    if (!Number(x)) throw Error(`/: number required, but got ${typeof x}`)
    return x
  }).reduce((x, y) => x / y),
  '#t': '#t',
  '#f': '#f',
  '=': args => args.reduce((x, y) => x === y ? '#t' : '#f'),
  'equal?': args => args.reduce((x, y) => x === y ? '#t' : '#f'),
  '<': args => {
    let result = true
    let prev = args[0]
    for (let i = 1; i < args.length; i++) {
      if (!result) { return '#f' }
      result = prev < args[i]
      prev = args[i]
    }
    return result ? '#t' : '#f'
  },
  '>': args => {
    let result = true
    let prev = args[0]
    for (let i = 1; i < args.length; i++) {
      if (!result) { return '#f' }
      result = prev > args[i]
      prev = args[i]
    }
    return result ? '#t' : '#f'
  },
  '<=': args => {
    let result = true
    let prev = args[0]
    for (let i = 1; i < args.length; i++) {
      if (!result) { return '#f' }
      result = prev <= args[i]
      prev = args[i]
    }
    return result ? '#t' : '#f'
  },
  '>=': args => {
    let result = true
    let prev = args[0]
    for (let i = 1; i < args.length; i++) {
      if (!result) { return '#f' }
      result = prev >= args[i]
      prev = args[i]
    }
    return result ? '#t' : '#f'
  },
  'not': x => x[0] !== '#f' ? '#f' : '#t',
  'begin': function () {
    let exprs = arguments[arguments.length - 1]
    return exprs[exprs.length - 1]
  },
  'max': args => args.reduce((x, y) => x > y ? x : y),
  'min': args => args.reduce((x, y) => x < y ? x : y),
  'length': x => x.length, //
  'null?': x => x === null ? '#t' : '#f',
  'number?': x => Number.isFinite(x) ? '#t' : '#f',
  'pi': 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679,
  'find': function (variable) {
    return this[variable] ? this : null
  }
}

const parse = toParse => {
  if (toParse[0] !== '(') {
    return Number(toParse) ? [[Number(toParse)]] : [[toParse]]
  }
  let tokens = []
  let openPrans = 1
  tokens.push('(')
  toParse = toParse.slice(1)
  let match
  while (openPrans !== 0) {
    if (match = toParse.match(/^\)\s*/)) {
      toParse = toParse.replace(match[0], '')
      tokens.push(')')
      openPrans--
    } else if (match = toParse.match(/^\(\s*/)) {
      toParse = toParse.replace(match[0], '')
      tokens.push('(')
      openPrans++
    } else {
      tokens.push((toParse.match(/[^\s()]*/)[0]))
      toParse = toParse.replace(/[^\s()]*\s*/, '')
    }
    if (toParse === '' && openPrans !== 0) {
      throw Error('Unexpected end of input')
    }
  }
  return [tokens, toParse]
}

const astFromTokens = tokensArrray => {
  if (tokensArrray.length === 0) {
    throw Error('Unexpected EOF')
  }
  let token = tokensArrray.shift()
  if (token === '(') {
    let expression = []
    while (tokensArrray[0] !== ')') {
      expression.push(astFromTokens(tokensArrray))
    }
    tokensArrray.shift()
    return expression
  } else if (token === ')') {
    throw Error('Unexpected )')
  } else {
    return atom(token)
  }
}

const atom = token => isNaN(Number(token)) ? token : Number(token)

const ast = toParse => astFromTokens(parse(toParse)[0])

function evaluation (exp, env) {
  if (env.find(exp)) {                // Variable Reference
    return env.find(exp)[exp]
  }
  if (!Array.isArray(exp)) {          // Constant number
    return Number(exp) ? Number(exp) : null
  }
  if (exp[0] === 'if') {              // Condition
    let [test, ifTrue, ifFalse] = exp.slice(1)
    let expr = evaluation(test, env) === '#t' ? ifTrue : ifFalse
    return evaluation(expr, env)
  }
  if (exp[0] === 'define') {          // Definition
    let symbol = exp[1]
    let expr = exp.slice(2)
    env[symbol] = evaluation(expr[0], env)
  }
  if (exp[0] === 'set!') {            // Assignment
    let symbol = exp[1]
    let expr = exp.slice(2)
    env.find(symbol)[symbol] = evaluation(expr, env)
  }
  if (exp[0] === 'lambda') {          // procedure
    let prams = exp[1]
    let body = exp[2]
    let proc = procedure.constructor(prams, body, env)
    return proc
  }
  let proc = evaluation(exp[0], env)  // Procedure call
  let args = exp.slice(1).map(x => evaluation(x, env))
  if (proc && args) {
    return proc.call(null, args)
  } else {
    console.log(exp)
  }
}
