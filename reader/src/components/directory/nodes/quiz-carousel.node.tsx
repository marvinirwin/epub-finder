import {QuizCardCarousel} from "../../quiz/quiz-card-carousel.component";
import React from "react";
import {AmpStories} from "@material-ui/icons";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {QUIZ_NODE} from "@shared/";


export function QuizCarouselNode(): TreeMenuNode {
    return {
        name: QUIZ_NODE,
        label: 'Quiz',
        LeftIcon: () => <AmpStories/>,
        Component: () => <QuizCardCarousel/>
    };
}