import React from 'react'
import { fireEvent, screen, render } from '@testing-library/react'
import { FocusGrid } from './FocusGrid'
import { FocusGridRow } from './FocusGridRow'
import { FocusGridCell } from './FocusGridCell'
import { FocusGridColumnHeader } from './FocusGridColumnHeader'

describe('FocusGrid', () => {
  test('all interactive elements are removed from the natural tab order', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={2} columnCount={2}>
        <FocusGridRow rowIndex={0}>
          <FocusGridCell columnIndex={0}>
            {/* [1:1:1] means row 1, cell 1, interactive element 1 */}
            <a href='example.com'>el:1:1:1</a>
          </FocusGridCell>
          <FocusGridCell columnIndex={1}>
            <button>el:1:2:1</button>
          </FocusGridCell>
        </FocusGridRow>
      </FocusGrid>
    )
    const buttons = screen.getAllByRole('button')
    const links = screen.getAllByRole('link')
    buttons.every((button) => {
      expect(button).toHaveAttribute('tabindex', '-1')
    })
    links.every((link) => {
      expect(link).toHaveAttribute('tabindex', '-1')
    })
  })

  test('sets first interactive element as a starting point', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={2} columnCount={2}>
        <FocusGridRow rowIndex={0}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:1:1:1</a>
          </FocusGridCell>
          <FocusGridCell columnIndex={1}>
            <button>el:1:2:1</button>
          </FocusGridCell>
        </FocusGridRow>
      </FocusGrid>
    )
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
  })

  test('always sets previously focused element tabindex back to -1', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={2} columnCount={2}>
        <FocusGridRow rowIndex={0}>
          <FocusGridColumnHeader columnIndex={0}>
            <a href='example.com'>el:1:1:1</a>
            <a href='example.com'>el:1:1:2</a>
          </FocusGridColumnHeader>
        </FocusGridRow>
      </FocusGrid>
    )
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '-1')
    expect(screen.queryByText('el:1:1:2')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(screen.queryByText('el:1:1:2')).toHaveAttribute('tabindex', '-1')
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
  })

  test('can move focus between interactive elements, skipping empty cells', () => {
    const rows = [0, 1, 2, 3]
    render(
      <FocusGrid label='MockGrid' rowCount={4} columnCount={4}>
        {rows.map((index) => (
          <FocusGridRow key={index} rowIndex={index}>
            <FocusGridCell columnIndex={0}>
              <a href='example.com'>el:{index + 1}:1:1</a>
              <a href='example.com'>el:{index + 1}:1:2</a>
            </FocusGridCell>
            <FocusGridCell columnIndex={1}>
              <button>el:{index + 1}:2:1</button>
            </FocusGridCell>
            <FocusGridCell columnIndex={2}>
              just some text, should be skipped by keyboard navigation
            </FocusGridCell>
            <FocusGridCell columnIndex={3}>
              {/* don't render element in the 3rd row. For testing vertical cell skipping */}
              {index + 1 === 3 ? null : <button>el:{index + 1}:4:1</button>}
            </FocusGridCell>
          </FocusGridRow>
        ))}
      </FocusGrid>
    )
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(screen.queryByText('el:1:1:2')).toHaveAttribute('tabindex', '0')
    // Move down to 2nd link in the cell in 2nd row.
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(screen.queryByText('el:2:1:2')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(screen.queryByText('el:2:2:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    // Skips [2:3], it's an empty cell
    expect(screen.queryByText('el:2:4:1')).toHaveAttribute('tabindex', '0')
    // Skips [3:4], it's an empty cell
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(screen.queryByText('el:4:4:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    // Skips [4:3], it's an empty cell
    expect(screen.queryByText('el:4:2:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(screen.queryByText('el:3:2:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(screen.queryByText('el:3:1:2')).toHaveAttribute('tabindex', '0')
    // Let's go back to [1:1:1]
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
  })

  test('works with headers', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={2} columnCount={2}>
        <FocusGridRow rowIndex={0}>
          <FocusGridColumnHeader columnIndex={0}>
            <a href='example.com'>el:1:1:1</a>
          </FocusGridColumnHeader>
          <FocusGridColumnHeader columnIndex={1} ariaSort='ascending'>
            <button>el:1:2:1</button>
          </FocusGridColumnHeader>
        </FocusGridRow>
        <FocusGridRow rowIndex={1}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:2:1:1</a>
          </FocusGridCell>
          <FocusGridCell columnIndex={1}>
            <button>el:2:2:1</button>
          </FocusGridCell>
        </FocusGridRow>
      </FocusGrid>
    )

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders[0]).not.toHaveAttribute('aria-sort')
    expect(columnHeaders[1]).toHaveAttribute('aria-sort', 'ascending')

    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '-1')
    expect(screen.queryByText('el:1:2:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(screen.queryByText('el:2:2:1')).toHaveAttribute('tabindex', '0')
  })

  test('Can travel up and down in a grid with sparce row indexes', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={2} columnCount={2}>
        <FocusGridRow rowIndex={0}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:1:1:1</a>
          </FocusGridCell>
        </FocusGridRow>
        <FocusGridRow rowIndex={100}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:100:1:1</a>
          </FocusGridCell>
        </FocusGridRow>
      </FocusGrid>
    )

    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(screen.queryByText('el:100:1:1')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(screen.queryByText('el:1:1:1')).toHaveAttribute('tabindex', '0')
  })

  test('When a row is clicked, arrow key presses cause focus to travel from the clicked row', () => {
    render(
      <FocusGrid label='MockGrid' rowCount={3} columnCount={1}>
        <FocusGridRow rowIndex={0}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:1:1:1</a>
          </FocusGridCell>
        </FocusGridRow>
        <FocusGridRow rowIndex={1}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:2:1:1</a>
          </FocusGridCell>
        </FocusGridRow>
        <FocusGridRow rowIndex={2}>
          <FocusGridCell columnIndex={0}>
            <a href='example.com'>el:3:1:1</a>
          </FocusGridCell>
        </FocusGridRow>
      </FocusGrid>
    )
    const grid = screen.getByRole('grid')
    const row2 = screen.getByText('el:2:1:1').parentElement!.parentElement!
    fireEvent.click(row2)
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(screen.queryByText('el:3:1:1')).toHaveAttribute('tabindex', '0')
  })
})
