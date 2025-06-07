import React, { useState, useEffect, useRef } from 'react';

const sampleQuestions = [
  {
    id: 1,
    question: 'Arrange the planets in order from closest to farthest from the Sun.',
    choices: ['Mars', 'Earth', 'Mercury', 'Venus'],
    correctOrder: ['Mercury', 'Venus', 'Earth', 'Mars'],
  },
  {
    id: 2,
    question: 'Arrange these events in chronological order.',
    choices: ['French Revolution', 'American Revolution', 'World War I', 'World War II'],
    correctOrder: [
      'American Revolution',
      'French Revolution',
      'World War I',
      'World War II',
    ],
  },
  {
    id: 3,
    question: 'Arrange these programming languages by release date.',
    choices: ['Java', 'Python', 'C', 'JavaScript'],
    correctOrder: ['C', 'Python', 'Java', 'JavaScript'],
  },
];

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [showChoices, setShowChoices] = useState(false);
  const [status, setStatus] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [score, setScore] = useState(0);
  const [questionStats, setQuestionStats] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);
  const startTimeRef = useRef(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    const shuffledQuestions = [...sampleQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffledQuestions);
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    if (current && showChoices) {
      setTimeTaken(0);
      startTimeRef.current = performance.now();
      setCountdown(10);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            submitAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [current, showChoices]);

  const playNotes = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + i * 100, context.currentTime);
      osc.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.2);
      await new Promise((res) => setTimeout(res, 300));
    }
  };

  const startRound = async () => {
    setStatus(null);
    setShowCorrectAnswer(false);
    const next = questions[currentIndex];
    setCurrent(next);
    setSelectedOrder([]);
    setShowChoices(false);
    await playNotes();
    setShuffledChoices([...next.choices].sort(() => 0.5 - Math.random()));
    setShowChoices(true);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrent(null);
      setStatus(null);
      setSelectedOrder([]);
      setShowChoices(false);
      setShowSummary(false);
      setShowCorrectAnswer(false);
    } else {
      alert(`Game Over! Your final score is ${score}/${questions.length}`);
      setShowSummary(true);
    }
  };

  const recordStats = (result, preciseTime) => {
    const stats = {
      question: current.question,
      result,
      time: preciseTime.toFixed(3),
    };
    setQuestionStats((prev) => [...prev, stats]);
  };

  const submitAnswer = () => {
    if (status) return;
    clearInterval(countdownRef.current);
    const endTime = performance.now();
    const preciseTime = (endTime - startTimeRef.current) / 1000;
    setTimeTaken(preciseTime);
    const correct =
      JSON.stringify(selectedOrder) === JSON.stringify(current.correctOrder);
    const resultText = correct ? '✅ Correct!' : '❌ Incorrect!';
    setStatus(resultText);
    if (!correct) setShowCorrectAnswer(true);
    if (correct) setScore(score + 1);
    recordStats(resultText, preciseTime);
  };

  const resetAnswer = () => {
    setSelectedOrder([]);
  };

  const toggleChoice = (choice) => {
    if (selectedOrder.includes(choice)) return;
    setSelectedOrder([...selectedOrder, choice]);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Fastest Finger First</h1>
      <h3>Score: {score}</h3>
      {questions.length > 0 && current && (
        <h4>
          Question {currentIndex + 1} of {questions.length}
        </h4>
      )}
      {!current && <button onClick={startRound}>Start Question</button>}

      {current && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>{current.question}</h2>
          {showChoices && (
            <>
              <h4>⏳ Time left: {countdown}s</h4>
              {shuffledChoices.map((choice) => (
                <button
                  key={choice}
                  disabled={selectedOrder.includes(choice)}
                  onClick={() => toggleChoice(choice)}
                  style={{ display: 'block', margin: '0.5rem 0', width: '100%' }}
                >
                  {choice}
                </button>
              ))}

              <div style={{ marginTop: '1rem' }}>
                <strong>Your Order:</strong>
                <ol>
                  {selectedOrder.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={submitAnswer}
                  disabled={selectedOrder.length < 4 || status}
                >
                  Submit Answer
                </button>
                <button
                  onClick={resetAnswer}
                  disabled={selectedOrder.length === 0 || status}
                >
                  Reset Answer
                </button>
              </div>
            </>
          )}

          {status && (
            <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
              {status} (⏱ {timeTaken.toFixed(3)}s)
              {showCorrectAnswer && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>✅ Correct Order:</strong>
                  <ol>
                    {current.correctOrder.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ol>
                </div>
              )}
              <div style={{ marginTop: '1rem' }}>
                <button onClick={nextQuestion}>Next Question</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSummary && questionStats.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>📝 Question Summary</h3>
          <ul>
            {questionStats.map((stat, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                <strong>Q{index + 1}:</strong> {stat.result} in {stat.time}s
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
