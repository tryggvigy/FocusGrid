type InteractiveEl = HTMLButtonElement | HTMLAnchorElement
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

/**
  This solution is entirely DOM based and uses the roving tabindex technique
    (https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex).
  This gives us the benefit of the focus management being transparent to the grid
  and its child components. If a new a or button is added to a cell in the grid it
  will work without modification.

  The downside is React can change the DOM from under our nose.
  Because of this, the first thing that is done before moving any focus is ensuring
  that there actually exists a focusable element (with tabindex="0" attribute) in
  the grid. If it doesn't exist, fall back to the first a/ button element in the grid.

  The solution relies on aria attributes and roles and assumes this structure:
    <div role="grid">
      <div role="row" aria-rowindex="0">
        <div role="gridcell | columnheader" aria-colindex="0">
          ...
          <a tabindex="-1"></a>
          <button tabindex="-1"></button>
          ...
        </div>
        ...
      </div>
      ...
    </div>

  As long as

  1. This hierarchy of selectors is true
      [role="grid"]
      └── [aria-rowindex]
          └── [aria-colindex]
              └── a, button
  2. aria-rowindex/aria-colindex are 1-based and sequential

  Then the keyboard navigation will work.
  Additional wrapper elements between each layer do not matter.

  @param grid the grid dom element
  @param direction the direction in which focus should be moved within the grid
 */
export function moveFocus(
  grid: HTMLDivElement | null,
  direction: Direction
): void {
  if (!grid) {
    // eslint-disable-next-line no-console
    console.error('No grid element found. Canceling moving focus')
    return
  }

  if (!ensureFocusableElementInGrid(grid)) return

  const currentFocus = grid.querySelector<InteractiveEl>('[tabindex="0"]')!

  if (direction === Direction.UP) {
    const nextCell = findNextCell(grid, currentFocus, Direction.UP)
    if (!nextCell) return
    transferFocus(
      currentFocus,
      getCorrespondingInteractiveElementInCell(currentFocus, nextCell)
    )
  }

  if (direction === Direction.DOWN) {
    const nextCell = findNextCell(grid, currentFocus, Direction.DOWN)
    if (!nextCell) return

    transferFocus(
      currentFocus,
      getCorrespondingInteractiveElementInCell(currentFocus, nextCell)
    )
  }

  if (direction === Direction.LEFT) {
    const nextEl = findNextElementInCell(currentFocus, -1)
    // Exit early if next focusable element is found in the cell
    if (nextEl) {
      transferFocus(currentFocus, nextEl)
      return
    }

    const nextCell = findNextCell(grid, currentFocus, Direction.LEFT)
    if (!nextCell) return

    // Target the last interactive element in the cell to the left
    const prevCellElems = nextCell.querySelectorAll<InteractiveEl>('a, button')
    const lastLink = prevCellElems[prevCellElems.length - 1]
    transferFocus(currentFocus, lastLink)
  }

  if (direction === Direction.RIGHT) {
    const nextEl = findNextElementInCell(currentFocus, 1)
    // Exit early if next focusable element is found in the cell
    if (nextEl) {
      transferFocus(currentFocus, nextEl)
      return
    }

    const nextCell = findNextCell(grid, currentFocus, Direction.RIGHT)
    if (!nextCell) return

    // Target the first interactive element in the cell to the right
    const nextCellEl = nextCell.querySelectorAll<InteractiveEl>('a, button')
    const firstEl = nextCellEl[0]
    transferFocus(currentFocus, firstEl)
  }
}
/**
 * Move focus to the first interactive element in the given row.
 * This is useful when a row element is clicked with a mouse.
 * In that case, when arrow key presses, we want the focus to move from the
 * clicked row instead of jumping back to the top of the grid or wherever
 * focus was previously.
 * @param row the row element to move focus to
 */
export function moveFocusToFirstInteractiveElementInRow(
  row: HTMLElement
): void {
  const grid = row.closest<HTMLDivElement>('[role="grid"]')
  if (!grid) return
  const firstElem = row.querySelectorAll<InteractiveEl>('a, button')[0]
  const currentFocusable = grid.querySelector<InteractiveEl>('[tabindex="0"]')
  transferFocus(currentFocusable, firstElem)
}

/**
 * Looks for an interactive element with tabindex="0" in the grid.
 * If none is found, set the first button/anchor to be that focusable element.
 *
 * The two situations where this is useful is:
 *   1. The first time the grid is keyboard navigated.
 *      This sets the initial position to the first element.
 *   2. Graceful fallback when in invalid states. React can update the DOM at
 *      any time and there can be cases where the tabindex="0" is lost.
 * @param grid grid element to check
 */
function ensureFocusableElementInGrid(grid: HTMLDivElement): boolean {
  const firstElem = grid.querySelectorAll<InteractiveEl>('a, button')[0]
  const currentFocusable = grid.querySelector('[tabindex="0"]') || firstElem

  // Happens if the grid does not contain any a or button elements.
  if (!currentFocusable) {
    return false
  }
  currentFocusable.setAttribute('tabindex', '0')
  return true
}

/**
 * Given an interactive element, find the corresponding
 * interactive element in give cell. The search is index based. If an element
 * with the same index is not found in the cell, fall back to the first element
 * in the cell.
 * @param element interactive element in a cell
 * @param cell the next cell to find the corresponding interactive element in
 */
function getCorrespondingInteractiveElementInCell(
  element: InteractiveEl,
  cell: HTMLDivElement
): InteractiveEl {
  const elementCell = element.closest('[aria-colindex]')!
  const allInteractiveElements = Array.from(
    elementCell.querySelectorAll<InteractiveEl>('a, button')
  )
  const currentElementIndex = allInteractiveElements.indexOf(element)

  const cellInteractives = cell.querySelectorAll<InteractiveEl>('a, button')
  return cellInteractives[currentElementIndex] || cellInteractives[0]
}

/**
 * Find the next/previous interactive element in the cell of provded element
 * @param element element to start search from
 * @param dir direction to search in, 1 : next, -1 : previous
 */
function findNextElementInCell(
  element: InteractiveEl,
  dir: 1 | -1
): InteractiveEl | null {
  const cellElements = Array.from(
    element
      .closest('[aria-colindex]')!
      .querySelectorAll<InteractiveEl>('a, button')
  )
  const prevIndex = cellElements.findIndex((l) => l === element) + dir
  return cellElements[prevIndex]
}

/**
 * Traverse the grid in a direction until a cell with interactive elements is found
 * @param grid the grid element
 * @param element element to start search from
 * @param direction The direction of search
 */
function findNextCell(
  grid: HTMLDivElement,
  element: InteractiveEl,
  direction: Direction
): HTMLDivElement | null {
  const elementRow = element.closest<HTMLDivElement>('[aria-rowindex]')!

  if (direction === Direction.DOWN) {
    const allRows = Array.from(
      grid.querySelectorAll<HTMLDivElement>('[aria-rowindex]')
    )
    const colIndex = element
      .closest('[aria-colindex]')!
      .getAttribute('aria-colindex')!
    const elementRowIndex = allRows.indexOf(elementRow)

    for (let i = elementRowIndex + 1; i < allRows.length; i++) {
      const nextRow = allRows[i]
      const cellInNextRow = nextRow.querySelector<HTMLDivElement>(
        `[aria-colindex="${colIndex}"]`
      )
      if (containsInteractiveElements(cellInNextRow)) return cellInNextRow
    }
  }

  if (direction === Direction.UP) {
    const allRows = Array.from(
      grid.querySelectorAll<HTMLDivElement>('[aria-rowindex]')
    )
    const elementRowIndex = allRows.indexOf(elementRow)
    const colIndex = element
      .closest('[aria-colindex]')!
      .getAttribute('aria-colindex')!

    for (let i = elementRowIndex - 1; i >= 0; i--) {
      const nextRow = allRows[i]
      const cellInNextRow = nextRow.querySelector<HTMLDivElement>(
        `[aria-colindex="${colIndex}"]`
      )
      if (containsInteractiveElements(cellInNextRow)) return cellInNextRow
    }
  }

  if (direction === Direction.LEFT) {
    const allCellsInRow = Array.from(
      elementRow.querySelectorAll<HTMLDivElement>('[aria-colindex]')
    )
    const elementCell = element.closest<HTMLDivElement>('[aria-colindex]')!
    const elementCellIndex = allCellsInRow.indexOf(elementCell)

    for (let i = elementCellIndex - 1; i >= 0; i--) {
      const nextCell = allCellsInRow[i]
      if (containsInteractiveElements(nextCell)) return nextCell
    }
  }

  if (direction === Direction.RIGHT) {
    const allCellsInRow = Array.from(
      elementRow.querySelectorAll<HTMLDivElement>('[aria-colindex]')
    )
    const elementCell = element.closest<HTMLDivElement>('[aria-colindex]')!
    const elementCellIndex = allCellsInRow.indexOf(elementCell)

    for (let i = elementCellIndex + 1; i < allCellsInRow.length; i++) {
      const nextCell = allCellsInRow[i]
      if (containsInteractiveElements(nextCell)) return nextCell
    }
  }

  // Hit edge of grid without finding the next cell
  return null
}

/**
 * Move focus from oldEl -> newEl
 * @param oldEl element loosing focus
 * @param newEl element gaining focus
 */
function transferFocus(
  oldEl: InteractiveEl | null,
  newEl: InteractiveEl
): void {
  if (oldEl) oldEl.tabIndex = -1
  if (newEl) {
    newEl.tabIndex = 0
    newEl.focus()
  }
}

function containsInteractiveElements(element: Element | null): boolean {
  if (!element) return false
  if (element.querySelector('a, button')) return true
  return false
}
