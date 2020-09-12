module AudioPlayer where

import Quickstrom
import Data.Maybe (Maybe(..))

readyWhen :: Selector
readyWhen = "#quiz_page"

-- Based on the specified actions, Quickstrom generates click actions
-- for all clickable elements.
actions :: Actions
actions = clicks

-- The proposition describes the correct behavior of the web
-- application.  Here we start in the paused state, and a valid
-- transition is either `play` or `pause`.
proposition :: Boolean
proposition =
  let
    -- When in the `playing` state, the button text is "Pause"
    atQuizPage = selectedNavItemId == Just "quiz_page"

    -- When in the `paused` state, the button text is "Play"
    atReadingPage = selectedNavItemId == Just "reading_page"

    -- The `play` transition means going from `paused` to `playing`
    quizPageToReadingPage =
      atQuizPage
        && next atReadingPage

    -- The `pause` transition means going from `playing` to `paused`
    readingpageToQuizPage =
      atReadingPage
        && next atQuizPage

    -- The `tick` transitions happens when we're in `playing`,
    -- changing the time display's text
    editCardDropsDown =
      (atQuizPage || atReadingPage) -- TODO can I use || like this?
        && 
        && next editingCardIsDroppedDown
    
  in
    -- This last part is the central part of the specification,
    -- describing the initial state and the possible transitions. It
    -- can be read in English as:
    --
    --   Initially, the record player is paused. From that point, one
    --   can either play or pause, or the time can tick while playing,
    --   all indefinitely.
    always (atQuizPage || atReadingPage)

selectedNavItemId :: String
selectedNavItemId = map _.id (queryOne "MuiBottomNavigationAction-root Mui-selected" { textContent })

quizzingCharacterText :: String 
quizzingCharacterText = map _.textContent (queryOne ".quiz-character" { id })

editingCardIsDroppedDown :: Boolean
editingCardIsDroppedDown = queryOne ".editing-card-dropdown" 