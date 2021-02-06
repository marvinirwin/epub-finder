import {QuizCardCarousel} from "../../quiz/quiz-card-carousel.component";
import React from "react";
import {AmpStories} from "@material-ui/icons";
import {TreeMenuNode} from "../tree-menu-node.interface";

export const QUIZ_NODE = 'quiz-carousel';

export function QuizCarouselNode(): TreeMenuNode {
    return {
        name: QUIZ_NODE,
        label: 'Quiz',
        moveDirectory: true,
        LeftIcon: () => <AmpStories/>,
        Component: () => <QuizCardCarousel/>
    };
}