import React, {
  useCallback,
  useRef,
  useImperativeHandle,
  KeyboardEvent
} from 'react'
import { moveFocus, Direction } from './focusManagement'

type Props = {
  children: React.ReactNode
  rowCount: number
  columnCount: number
  label: string
  className?: string
  onKeyDown?: React.KeyboardEventHandler
}

export const FocusGrid = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      className,
      rowCount,
      columnCount,
      label,
      onKeyDown = (): void => {}
    },
    ref
  ) => {
    const gridRef = useRef<HTMLDivElement>(null)

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
      ref,
      () => gridRef.current
    )

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        const isUp = e.key === 'ArrowUp'
        const isDown = e.key === 'ArrowDown'
        const isLeft = e.key === 'ArrowLeft'
        const isRight = e.key === 'ArrowRight'

        // Prevent scrolling
        if (isUp || isDown) {
          e.preventDefault()
        }

        if (isUp || isDown || isLeft || isRight) {
          // Enable focus outline
          document.documentElement.classList.remove('no-focus-outline')
        }

        if (isUp) moveFocus(gridRef.current, Direction.UP)
        if (isDown) moveFocus(gridRef.current, Direction.DOWN)
        if (isLeft) moveFocus(gridRef.current, Direction.LEFT)
        if (isRight) moveFocus(gridRef.current, Direction.RIGHT)

        onKeyDown(e)
      },
      [onKeyDown]
    )

    return (
      <div
        ref={gridRef}
        role='grid'
        aria-rowcount={rowCount}
        aria-colcount={columnCount}
        aria-label={label}
        className={className}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {children}
      </div>
    )
  }
)
