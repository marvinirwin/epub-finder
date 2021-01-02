import {QuizCardCarousel} from "../../quiz/quiz-card-carousel.component";

export const QUIZ_NODE = 'quiz';

export function QuizCarouselNode() {
    return {
        name: QUIZ_NODE,
        label: 'Quiz',
        moveDirectory: true,
        Component: QuizCardCarousel
    };
}