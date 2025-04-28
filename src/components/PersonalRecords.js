import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, deleteDoc, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/main.jpg';
import StreakTracker from './StreakTracker';
import { onAuthStateChanged } from 'firebase/auth';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const PersonalRecords = () => {
  const [quizRecords, setQuizRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [chartData, setChartData] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();

  const uniqueCourses = [...new Set(quizRecords.map(record => record.subject))];

  const calculateRating = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 40) return 2;
    if (percentage >= 20) return 1;
    return 0;
  };

  const calculateOverallRating = (totalScore, totalQuestions) => {
    if (totalQuestions === 0) return 0;
    const averageScore = (totalScore / totalQuestions) * 100;
    return calculateRating(averageScore, 100);
  };

  const getCourseRating = (courseName) => {
    const courseRecords = quizRecords.filter(record => record.subject === courseName);
  
    let totalScore = 0;
    let totalQuestions = 0;
  
    courseRecords.forEach(record => {
      totalScore += record.score;
      totalQuestions += record.totalQuestions;
    });
  
    if (totalQuestions === 0) return 0;
    const averageScore = (totalScore / totalQuestions) * 100;
    
    return calculateRating(averageScore, 100);
  };
  
  const generateChartData = () => {
    const filteredRecords = selectedCourse ? quizRecords.filter((record) => record.subject === selectedCourse) : quizRecords;
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      return a.dateTaken.seconds - b.dateTaken.seconds; 
    });

    const subjectData = {};
    sortedRecords.forEach((record) => {
      const date = new Date(record.dateTaken.seconds * 1000);
      const formattedDate = date.toLocaleString();
      const subject = record.subject;
      const scorePercentage = (record.score / record.totalQuestions) * 100;

      if (!subjectData[subject]) {
        subjectData[subject] = {
          dates: [],
          scores: [],
        };
      }
      subjectData[subject].dates.push(formattedDate);
      subjectData[subject].scores.push(scorePercentage);
    });

    const lineDatasets = Object.keys(subjectData).map((subject) => ({
      label: subject,
      data: subjectData[subject].scores,
      fill: false,
      borderColor: getRandomColor(),
      tension: 0.1,
    }));

    // const areaDatasets = Object.keys(subjectData).map((subject)  => ({
    //   label: subject,
    //   data: subjectData[subject].scores,
    //   fill: true,
    //   backgroundColor: getRandomColor().concat('80'),
    //   borderColor: getRandomColor(),
    //   tension: 0.1,
    // }));

    const dailyAverages = {};
    const dayLabels = [];
    sortedRecords.forEach((record) => {
      const date = new Date(record.dateTaken.seconds * 1000);
      const dayKey = date.toLocaleDateString();
      const scorePercentage = (record.score / record.totalQuestions) * 100;

      if (!dailyAverages[dayKey]) {
        dailyAverages[dayKey] = [];
        dayLabels.push(dayKey);
      }
      dailyAverages[dayKey].push(scorePercentage);
    });

    const barDatasets = Object.keys(subjectData).map((subject) => {
      const subjectScoresByDay = {};
      dayLabels.forEach(day => subjectScoresByDay[day] = []);
      sortedRecords.forEach((record) => {
        if (record.subject === subject) {
          const date = new Date(record.dateTaken.seconds * 1000);
          const dayKey = date.toLocaleDateString();
          const scorePercentage = (record.score / record.totalQuestions) * 100;

          subjectScoresByDay[dayKey].push(scorePercentage);
        }
      });
  
      const averages = dayLabels.map(day => {
        const scores = subjectScoresByDay[day];
        return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
      });
    
      return {
        label: subject,
        data: averages.slice(-7),
        backgroundColor: getRandomColor(),
      };
    });    

    // const pieData = {
    //   labels: Object.keys(subjectData),
    //   datasets: [{
    //     data: Object.keys(subjectData).map(subject => {
    //       const scores = subjectData[subject].scores;
    //       return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0; // Average score per subject
    //     }),
    //     backgroundColor: Object.keys(subjectData).map(() => getRandomColor()),
    //   }],
    // };

    setChartData({
      line: {
        labels: Object.values(subjectData)[0]?.dates || [],
        datasets: lineDatasets,
      },
      // area: {
      //   labels: Object.values(subjectData)[0]?.dates || [],
      //   datasets: areaDatasets,
      // },
      bar: {
        labels: dayLabels.slice(-5).map(label => {
          const date = new Date(label);
          return date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
        }),
        datasets: barDatasets,
      },
      // pie: pieData,
    });
  
    setShowGraph(true);
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    if (showGraph) {
      generateChartData();
    }
  }, [selectedCourse, quizRecords]);
  
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUsername(userDoc.data().username);
            } else {
              setUsername(currentUser.displayName || 'User');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
          setLoading(false);
        } else {
          navigate('/login');
        }
      });
      return () => unsubscribe();
    }, [navigate]);
  useEffect(() => {
    const fetchQuizRecords = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
          const unsubscribe = onSnapshot(quizScoresRef, (querySnapshot) => {
          const records = querySnapshot.docs.map((doc) => doc.data());
          let totalScore = 0;
          let totalQuestions = 0;
          records.forEach((record) => {
            totalScore += record.score;
            totalQuestions += record.totalQuestions;
          });
          const overall = calculateOverallRating(totalScore, totalQuestions);
          setOverallRating(overall);
          setQuizRecords(records);
          setLoading(false);
        });
        return() => unsubscribe();
        } catch (error) {
          console.error('Error fetching quiz scores:', error);
        } 
      } else {
        navigate('/login');
      }
    };

    fetchQuizRecords();
    return () => {
        setLoading(true);
      };
  }, [navigate]);

  const resetQuizScores = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
        const querySnapshot = await getDocs(quizScoresRef);
        const confirmReset = window.confirm('Are you sure you want to delete all your quiz scores? This action cannot be undone.');

        if (confirmReset) {
          const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
          await Promise.all(deletePromises);

          setQuizRecords([]);
          console.log('All quiz scores have been deleted.');
        }
      } catch (error) {
        console.error('Error deleting quiz scores:', error);
      }
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
    <div style={styles.background}></div>
    <div style={styles.title}>
        <div style={styles.ratingcontainer}>
        <h2>{username}'s Quiz Records</h2>
        </div>
        <StreakTracker/>
    </div>
    <div style={styles.content}>
      {quizRecords.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={{fontSize: '50px', fontWeight: 900}}>No quiz records available.</p>
        </div>
      ) : (
        <div style={styles.recordsContainer}>
          {quizRecords.map((record, index) => {
            const rating = calculateRating(record.score, record.totalQuestions);
            return (
            <div key={index} style={styles.recordCard}>
              <h3 style={styles.quizName}>{record.subject}</h3>
              <p style={styles.recordDetails}>Difficulty: {record.difficulty}</p>
              <p style={styles.recordDetails}>Score: {record.score}/{record.totalQuestions}</p>
              <p style={styles.recordDetails}>Date Taken: {record.dateTaken ? new Date(record.dateTaken.seconds * 1000).toLocaleString() : 'N/A'}</p>
              <div style={styles.starRating}>
                <p style={styles.recordDetails}>Quiz Potential: {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={i < rating ? styles.filledStar : styles.emptyStar}>
                    ★
                  </span>
                ))}</p>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
        <div style={styles.button}>
          <div style={styles.buttonContainer}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>Go Back</button>
            <button onClick={generateChartData} style={styles.generateGraphButton}>Generate Progress Graph</button>
            <button onClick={resetQuizScores} style={styles.resetButton}>Reset All Scores</button>
          </div>
        </div>
        {showGraph && (
        <div style={styles.graphContainer}>
          <button 
            style={styles.closeButton} 
            onClick={() => setShowGraph(false)}
          >
            ×
          </button>
          <p style={styles.recordDetails1}>
              Progress Snapshot:
                {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={i < (selectedCourse ? getCourseRating(selectedCourse) : overallRating) ? styles.filledStar1 : styles.emptyStar1}>
                ★
                </span>
            ))}
          </p>
          <div style={styles.dropdownContainer}>
            <label htmlFor="courseSelect">Select Course:</label>
            <select 
              id="courseSelect" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={styles.dropdown}
            >
              <option value="">All Courses</option>
              {uniqueCourses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Line Graph: Performance Over Time</p>
              <Line data={chartData.line} />
            </div>
            {/* <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Area Graph: Performance Over Time</p>
              <Line data={chartData.area} />
            </div> */}
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Bar Chart: Weekly Scores</p>
              <Bar data={chartData.bar} />
            </div>
            {/* <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Pie Chart: Score Distribution</p>
              <Pie data={chartData.pie} />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
},
background: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`, 
    backgroundPosition: 'center', 
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    opacity: 0.5,
    zIndex: -1,
},
title: {
    fontSize: '25px',
    marginBottom: '10px',
    color: '#333',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
    zIndex: 1,
  },
  noDataContainer: {
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.7)',
    width: '80%',
    textAlign: 'center'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px',
    marginTop: '10px',
    marginBottom: '20px',
    zIndex: '2',
    opacity: 0.9,
    flex: 1,         
    overflowY: 'auto',
  },
  recordsContainer: {
    width: '96%',
    flex: 1,         
    overflowY: 'auto',
    padding: '20px',
    opacity: '0.9',
    marginBottom: '80px'
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  quizName: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
  },
  ratingcontainer: {
    textAlign: 'center',
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.5)',
    flexDirection: 'column',
    flex: 1, 
    display: 'flex',
  },
  recordDetails: {
    fontSize: '16px',
    color: '#555',
  },
  starRating: {
    display: 'flex',
    marginTop: '10px',
  },
  filledStar: {
    color: '#FFD700',
    fontSize: '30px',
  },
  emptyStar: {
    color: '#D3D3D3',
    fontSize: '30px',
  },
  filledStar1: {
    color: '#FFD700',
    fontSize: '30px',
  },
  emptyStar1: {
    color: '#D3D3D3',
    fontSize: '30px',
  },
  recordDetails1: {
    fontSize: '25px',
    fontWeight: 900,
    color: '#000',
    textAlign: 'left',
    padding: '5px'
  },
  backButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    width: '40%',
    zIndex: 2,
  },
  resetButton: {
    backgroundColor: '#FF4C4C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    width: '40%',
    zIndex: 2,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    gap: '20px',        
    width: '80%',          
    margin: '0 auto',
    zIndex: 2,      
  },
  button: {
    position: 'fixed',
    bottom: '0',
    padding: '10px',
    display: 'flex',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    width: '90%',
    marginBottom: '30px',
    flexDirection: 'row',
    zIndex: 2,
  },
  generateGraphButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    width: '40%',
  },
  graphContainer: {
    position: 'fixed',
    top: '50%',       
    left: '50%',       
    transform: 'translate(-50%, -50%)',
    width: '90vw',  
    height: '90vh', 
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '20px',
    overflowX: 'scroll',
    overflowY: 'scroll',
    zIndex: 9999,
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#888',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  dropdownContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dropdown: {
    padding: '10px',
    borderRadius: '5px',
    fontSize: '16px',
    width: '80%',
  },
};

export default PersonalRecords;