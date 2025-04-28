{questions[currentQuestionIndex].type === "Preamble" ? (
    <div style={styles.preambleContainer}>
      <h3>{questions[currentQuestionIndex].question}</h3>
      {questions[currentQuestionIndex].image && (
        <img src={questions[currentQuestionIndex].image} alt="Preamble Image" style={styles.diagramImage} />
      )}
      <p>{questions[currentQuestionIndex].content}</p>
      <button style={styles.nextButton} onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
        Next
      </button>
    </div>
    ) : (
  <>
    {currentQuestionIndex > 0 && questions[currentQuestionIndex - 1].type === "Preamble" && (
      <div style={styles.preambleReference}>
        <h4>Reference: {questions[currentQuestionIndex - 1].question}</h4>
        <p>{questions[currentQuestionIndex - 1].content}</p>
      </div>
    )}
    </>
)}