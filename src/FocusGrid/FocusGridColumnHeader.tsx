import React, { useRef } from 'react'
import { useRemoveInteractiveElementsFromTabOrder } from './useRemoveInteractiveElementsFromTabOrder'

type Props = {
  columnIndex: number
  className?: string
  ariaSort?: 'ascending' | 'descending' | 'none' | 'other'
}

export const FocusGridColumnHeader: React.FC<Props> = ({
  children,
  ariaSort,
  columnIndex,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useRemoveInteractiveElementsFromTabOrder(ref)

  return (
    <div
      ref={ref}
      className={className}
      role='columnheader'
      aria-colindex={columnIndex + 1}
      // Only include the aria-sort attribute if present
      {...(ariaSort ? { 'aria-sort': ariaSort } : {})}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}
