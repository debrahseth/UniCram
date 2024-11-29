import React, { useState } from 'react';
import quizData from '../assets/quizData';

const QuizScreen = ({ selectedQuiz, challengerId, challengedId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [challengerScore, setChallengerScore] = useState(0);
  const [challengedScore, setChallengedScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [answered, setAnswered] = useState(false);
  
  const quizQuestions = quizData[selectedQuiz];
  
  if (!quizQuestions) {
    return <p>Quiz not found</p>;
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const handleAnswerSelection = (selectedAnswer, userType) => {
    if (answered) return;
    if (selectedAnswer === currentQuestion.answer) {
      if (userType === 'challenger') {
        setChallengerScore(challengerScore + 1);
      } else if (userType === 'challenged') {
        setChallengedScore(challengedScore + 1);
      }
    }

    setAnswered(true);
    setTimeout(() => {
      if (currentQuestionIndex + 1 < quizQuestions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswered(false);
      } else {
        setIsQuizComplete(true);
      }
    }, 1000); 
  };
  const restartQuiz = () => {
    setChallengerScore(0);
    setChallengedScore(0);
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);
    setAnswered(false);
  };
  return (
    <div>
      {isQuizComplete ? (
        <div>
          <h2>Quiz Complete!</h2>
          <p><strong>Challenger's score:</strong> {challengerScore} / {quizQuestions.length}</p>
          <p><strong>Challenged's score:</strong> {challengedScore} / {quizQuestions.length}</p>
          {challengerScore > challengedScore ? (
            <p>The Challenger wins!</p>
          ) : challengedScore > challengerScore ? (
            <p>The Challenged wins!</p>
          ) : (
            <p>It's a tie!</p>
          )}
          <button onClick={restartQuiz}>Restart Quiz</button>
        </div>
      ) : (
        <div>
          <h2>{selectedQuiz}</h2>
          <p>{currentQuestion.question}</p>
          <div>
            {currentQuestion.options.map((option, index) => (
              <div key={index}>
                <button
                  onClick={() => handleAnswerSelection(option, 'challenger')}
                  disabled={answered}
                >
                  {option}
                </button>
                <button
                  onClick={() => handleAnswerSelection(option, 'challenged')}
                  disabled={answered}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
