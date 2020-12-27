import {QuizCardCarousel} from "../../quiz/quiz-card-carousel.component";

export function QuizCarouselNode() {
    return {
        name: 'quiz',
        label: 'Quiz',
        moveDirectory: true,
        Component: QuizCardCarousel
    };
}