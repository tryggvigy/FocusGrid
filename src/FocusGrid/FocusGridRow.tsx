import React, { MouseEventHandler } from 'react'
import { moveFocusToFirstInteractiveElementInRow } from './focusManagement'

type Props = {
  rowIndex: number
  className?: string
  'aria-selected'?: boolean
}

export const FocusGridRow: React.FC<Props> = ({
  children,
  rowIndex,
  className,
  'aria-selected': ariaSelected
}) => {
  const handleClick: MouseEventHandler = (e): void => {
    const row = e.currentTarget as HTMLDivElement
    // If row does not already contain the currently focused element, then move
    // focus to first interactive element in row.
    if (!row.contains(document.activeElement)) {
      moveFocusToFirstInteractiveElementInRow(row)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={className}
      role='row'
      aria-rowindex={rowIndex + 1}
      aria-selected={ariaSelected}
    >
      {children}
    </div>
  )
}
