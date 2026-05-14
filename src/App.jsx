import React, { useState, useCallback } from 'react'

const buttons = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

function evaluate(a, op, b) {
  const x = parseFloat(a)
  const y = parseFloat(b)
  if (isNaN(x) || isNaN(y)) return '0'
  switch (op) {
    case '+': return String(x + y)
    case '−': return String(x - y)
    case '×': return String(x * y)
    case '÷': return y === 0 ? 'Error' : String(x / y)
    default: return b
  }
}

function formatDisplay(val) {
  if (val === 'Error') return 'Error'
  const num = parseFloat(val)
  if (isNaN(num)) return '0'
  // Limit to 10 significant digits for display
  const str = parseFloat(num.toPrecision(10)).toString()
  return str.length > 12 ? num.toExponential(4) : str
}

export default function App() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const handleButton = useCallback((label) => {
    // Clear / reset
    if (label === 'AC') {
      setDisplay('0')
      setPrev(null)
      setOperator(null)
      setWaitingForOperand(false)
      return
    }

    // Toggle sign
    if (label === '+/-') {
      setDisplay(d => d === '0' ? '0' : String(parseFloat(d) * -1))
      return
    }

    // Percentage
    if (label === '%') {
      setDisplay(d => String(parseFloat(d) / 100))
      return
    }

    // Operators
    if (['÷', '×', '−', '+'].includes(label)) {
      if (operator && !waitingForOperand) {
        const result = evaluate(prev, operator, display)
        setDisplay(result)
        setPrev(result)
      } else {
        setPrev(display)
      }
      setOperator(label)
      setWaitingForOperand(true)
      return
    }

    // Equals
    if (label === '=') {
      if (operator && prev !== null) {
        const result = evaluate(prev, operator, display)
        setDisplay(result)
        setPrev(null)
        setOperator(null)
        setWaitingForOperand(false)
      }
      return
    }

    // Decimal point
    if (label === '.') {
      const current = waitingForOperand ? '0' : display
      if (!current.includes('.')) {
        setDisplay(current + '.')
        setWaitingForOperand(false)
      }
      return
    }

    // Digits
    if (waitingForOperand) {
      setDisplay(label)
      setWaitingForOperand(false)
    } else {
      setDisplay(d => d === '0' ? label : d.length >= 12 ? d : d + label)
    }
  }, [display, prev, operator, waitingForOperand])

  const isOperator = (label) => ['÷', '×', '−', '+'].includes(label)
  const isTopRow = (label) => ['AC', '+/-', '%'].includes(label)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-80 rounded-3xl overflow-hidden shadow-2xl bg-black">
        {/* Display */}
        <div className="px-6 pt-10 pb-4 flex flex-col items-end">
          {operator && (
            <div className="text-gray-500 text-lg h-6 mb-1">
              {formatDisplay(prev)} {operator}
            </div>
          )}
          <div
            className="text-white font-light leading-none text-right w-full overflow-hidden"
            style={{ fontSize: display.length > 9 ? '2.5rem' : display.length > 6 ? '3.5rem' : '4.5rem' }}
          >
            {formatDisplay(display)}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3 p-4">
          {buttons.map((row, rIdx) =>
            row.map((label, cIdx) => {
              const isWide = label === '0'
              const isOp = isOperator(label)
              const isTop = isTopRow(label) || label === '%'
              const isEquals = label === '='
              const isActiveOp = operator === label && waitingForOperand

              let bg = 'bg-gray-600 hover:bg-gray-500'
              if (isTop) bg = 'bg-gray-400 hover:bg-gray-300'
              if (isOp || isEquals) bg = isActiveOp
                ? 'bg-white hover:bg-gray-100'
                : 'bg-orange-500 hover:bg-orange-400'

              let textColor = 'text-white'
              if (isTop) textColor = 'text-black'
              if (isActiveOp) textColor = 'text-orange-500'

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleButton(label)}
                  className={`
                    ${isWide ? 'col-span-2' : 'col-span-1'}
                    ${bg} ${textColor}
                    h-16 rounded-full text-2xl font-medium
                    flex items-center
                    ${isWide ? 'justify-start pl-6' : 'justify-center'}
                    transition-colors duration-100 active:scale-95
                    select-none cursor-pointer
                  `}
                >
                  {label}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
