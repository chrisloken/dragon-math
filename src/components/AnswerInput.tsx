import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'

interface AnswerInputProps {
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      ref.current?.focus()
    }
  }, [disabled])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = e.currentTarget.value
      onSubmit(value)
      e.currentTarget.value = ''
    }
  }

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')
  }

  return (
    <div className="answer-input-wrap">
      <label className="answer-label" htmlFor="answer">
        Type the answer
      </label>
      <input
        id="answer"
        ref={ref}
        className="answer-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBlur={() => {
          if (!disabled) ref.current?.focus()
        }}
        aria-label="Enter the multiplication answer"
      />
    </div>
  )
}
