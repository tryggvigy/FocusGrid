import React, { useRef } from 'react'
import { useRemoveInteractiveElementsFromTabOrder } from './useRemoveInteractiveElementsFromTabOrder'

type Props = {
  columnIndex: number
  className?: string
}

export const FocusGridCell: React.FC<Props> = ({
  children,
  columnIndex,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useRemoveInteractiveElementsFromTabOrder(ref)

  return (
    <div
      ref={ref}
      className={className}
      role='gridcell'
      aria-colindex={columnIndex + 1}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}
