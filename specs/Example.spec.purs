module AudioPlayer where

import Quickstrom
import Data.Maybe (Maybe(..))

readyWhen :: Selector
readyWhen = "#quiz_page"

actions :: Actions
actions = clicks

proposition :: Boolean
proposition = true