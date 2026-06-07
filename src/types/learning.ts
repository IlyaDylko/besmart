export type Topic = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  lessonCount: number;
};

export type LessonSlide = {
  title: string;
  body: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  topicId: string;
  title: string;
  durationMinutes: number;
  slides: LessonSlide[];
  quiz: QuizQuestion[];
};

export type LearningGoal =
  | 'curiosity'
  | 'career'
  | 'memory'
  | 'conversation'
  | 'habit';
