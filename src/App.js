import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
// import Home from "./components/Home";
import Profile from "./components/Profile";
import Leaderboard from "./components/Leaderboard";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import PersonalRecords from "./components/PersonalRecords";
import ChallengeSendingScreen from "./components/ChallengeSendingScreen";
import ChallengesReceivedScreen from "./components/ChallengesReceivedScreen";
import QuizScreen from "./components/QuizScreen";
import QuizScreen2 from "./components/QuizScreen2";
import QuizCompleted from "./components/QuizCompleted";
import UserListScreen from "./components/UserListScreen";
import TestYourself from "./components/TestYourself";
import ReviewQuiz from "./components/ReviewQuiz";
import About from "./components/About";
import DailyChallenge from "./components/DailyChallenge";
import WeeklyLeaderBoard from "./components/WeeklyLeaderBoard";
import LiveQuiz from "./components/LiveQuiz";
import AdminDashboard from "./components/AdminDashboard";
import TopPerformers from "./components/TopPerformers";
import Messages from "./components/Messages";
import TextingScreen from "./components/TextingScreen";
import AdminSplashScreen from "./components/AdminSplashScreen";
import ComplaintScreen from "./components/ComplaintScreen";
import AdminComplaintsScreen from "./components/AdminComplaintsScreen";
import QuizQuest from "./components/QuizQuest";
import ShutdownScreen from "./components/Shutdown";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/admin-splash" element={<AdminSplashScreen />} />
        <Route path="/record" element={<PersonalRecords />} />
        <Route path="/challenge" element={<ChallengeSendingScreen />} />
        <Route path="/received" element={<ChallengesReceivedScreen />} />
        <Route path="/Quiz/:challengeId" element={<QuizScreen />} />
        <Route path="/Quiz2/:challengeId" element={<QuizScreen2 />} />
        <Route path="/quiz-completed" element={<QuizCompleted />} />
        <Route path="/users" element={<UserListScreen />} />
        <Route path="/test-yourself" element={<TestYourself />} />
        <Route path="/review" element={<ReviewQuiz />} />
        <Route path="/about" element={<About />} />
        <Route path="/daily-challenge" element={<DailyChallenge />} />
        <Route path="/weekly-leaderboard" element={<WeeklyLeaderBoard />} />
        <Route path="/live-quiz" element={<LiveQuiz />} />
        <Route path="/quiz-quest" element={<QuizQuest />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/top-performers" element={<TopPerformers />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/texting" element={<TextingScreen />} />
        <Route path="/complaint" element={<ComplaintScreen />} />
        <Route path="/admin-complaint" element={<AdminComplaintsScreen />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<ShutdownScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
