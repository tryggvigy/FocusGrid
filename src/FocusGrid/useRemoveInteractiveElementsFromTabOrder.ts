import React, { useEffect } from 'react'

// On rerenders, remove any potential incoming
// interactive elements from the natural tab order
export const useRemoveInteractiveElementsFromTabOrder = (
  ref: React.RefObject<HTMLElement>
): void => {
  useEffect(() => {
    if (!ref.current) return

    const interactiveElements = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
        'a:not([tabindex="0"]), button:not([tabindex="0"])'
      )
    )

    interactiveElements.forEach((el) => el.setAttribute('tabindex', '-1'))
  })
}
