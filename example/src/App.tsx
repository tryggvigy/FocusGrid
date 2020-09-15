import React from 'react'

import {
  FocusGrid,
  FocusGridCell,
  FocusGridColumnHeader,
  FocusGridRow
} from 'react-focus-grid'
import 'react-focus-grid/dist/index.css'

const App = () => (
  <div>
    <h1>Accessible Grid</h1>
    <p>
      Start <a href='#'>pressing</a> the Tab key until you <a href='#'>reach</a>{' '}
      the grid
    </p>

    <FocusGrid className='grid' columnCount={3} rowCount={3} label='Playlist'>
      <FocusGridRow className='grid__row' rowIndex={0}>
        <FocusGridColumnHeader className='grid__header-row' columnIndex={0}>
          <button>TITLE</button>
        </FocusGridColumnHeader>
        <FocusGridColumnHeader className='grid__header-row' columnIndex={1}>
          <button>ALBUM</button>
        </FocusGridColumnHeader>
        <FocusGridColumnHeader className='grid__header-row' columnIndex={2}>
          <button>DURATION</button>
        </FocusGridColumnHeader>
      </FocusGridRow>
      <FocusGridRow className='grid__row' rowIndex={1}>
        <FocusGridCell columnIndex={0}>
          <div>Black Parade</div>
          <a href='#'>Beyoncé</a>
        </FocusGridCell>
        <FocusGridCell columnIndex={1}></FocusGridCell>
        <FocusGridCell columnIndex={2}>
          4:41
          <button className='heart'>
            <span className='sr-only'>Add to your liked songs</span>♡
          </button>
        </FocusGridCell>
      </FocusGridRow>
      <FocusGridRow className='grid__row' rowIndex={2}>
        <FocusGridCell columnIndex={0}>
          <div>Texas Sun</div>
          <a href='#'>Kruangbin</a>,<a href='#'>Leon Bridges</a>
        </FocusGridCell>
        <FocusGridCell columnIndex={1}>
          <a href='#'>Texas Sun</a>
        </FocusGridCell>
        <FocusGridCell columnIndex={2}>
          4:12
          <button className='heart'>
            <span className='sr-only'>Add to your liked songs</span>♡
          </button>
        </FocusGridCell>
      </FocusGridRow>
      <FocusGridRow className='grid__row' rowIndex={3}>
        <FocusGridCell columnIndex={0}>
          <div>Disconnect</div>
          <a href='#'>Basement</a>
        </FocusGridCell>
        <FocusGridCell columnIndex={1}>
          <a href='#'>Beside Myself</a>
        </FocusGridCell>
        <FocusGridCell columnIndex={2}>
          3:29
          <button className='heart'>
            <span className='sr-only'>Add to your liked songs</span>♡
          </button>
        </FocusGridCell>
      </FocusGridRow>
    </FocusGrid>
    <img
      className='arrow-keys-indicator'
      src='https://www.w3.org/TR/wai-aria-practices/examples/grid/imgs/black_keys.png'
      alt=''
    />

    <p>
      The <a href='#'>links</a> in this section should be{' '}
      <a href='#'>reachable</a> with a single Tab key press if the grid is in
      focus.
    </p>
  </div>
)

export default App
