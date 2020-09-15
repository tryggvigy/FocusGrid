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
        // Prevent scrolling
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
        }

        if (
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight'
        ) {
          // Enable focus outline
          document.documentElement.classList.remove('no-focus-outline')
        }

        if (e.key === 'ArrowUp') moveFocus(gridRef.current, Direction.UP)
        if (e.key === 'ArrowDown') moveFocus(gridRef.current, Direction.DOWN)
        if (e.key === 'ArrowLeft') moveFocus(gridRef.current, Direction.LEFT)
        if (e.key === 'ArrowRight') moveFocus(gridRef.current, Direction.RIGHT)

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
