import { useEffect, useRef, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react'

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

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (disabled) return
    const next = e.relatedTarget
    // Let HUD controls (Rain, Facts, etc.) receive clicks without focus stealing.
    if (next instanceof HTMLElement && next.closest('button, a, [tabindex]')) {
      return
    }
    // Defer so a mousedown on Rain/Facts can complete before we reclaim focus.
    window.setTimeout(() => {
      if (disabled) return
      const active = document.activeElement
      if (active instanceof HTMLElement && active.closest('button, a, [tabindex]')) {
        return
      }
      ref.current?.focus()
    }, 0)
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
        onBlur={handleBlur}
        aria-label="Enter the multiplication answer"
      />
    </div>
  )
}
