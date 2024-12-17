import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import PersonalRecords from './components/PersonalRecords';
import ChallengeSendingScreen from './components/ChallengeSendingScreen';
import ChallengesReceivedScreen from './components/ChallengesReceivedScreen';
import QuizScreen from './components/QuizScreen';
import QuizScreen2 from './components/QuizScreen2';
import QuizCompleted from './components/QuizCompleted';
import UserListScreen from './components/UserListScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/record" element={<PersonalRecords />} />
        <Route path="/challenge" element={<ChallengeSendingScreen />} />
        <Route path="/received" element={<ChallengesReceivedScreen />} />
        <Route path="/Quiz/:challengeId" element={<QuizScreen />} />
        <Route path="/Quiz2/:challengeId" element={<QuizScreen2 />} />
        <Route path="/quiz-completed" element={<QuizCompleted />} />
        <Route path="/users" element={<UserListScreen />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
