import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { FaPaperPlane, FaArrowCircleLeft } from 'react-icons/fa';
import logo from '../assets/main.jpg';
import logo1 from '../assets/logo1.jpg';
import { courseData } from '../questions/courseData'; 
import { dotStream } from 'ldrs';

const ChallengeSendingScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserId(currentUser.uid);
    }
  
    const fetchUserDetails = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const loggedInUserData = userSnap.data();
          const { levelOfStudy, semesterOfStudy, programOfStudy } = loggedInUserData;
          setUserData(loggedInUserData);
  
          const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            try {
              const userList = snapshot.docs
                .filter(doc => {
                  const userData = doc.data();
                  return (
                    doc.id !== currentUser.uid &&
                    userData.levelOfStudy === levelOfStudy &&
                    userData.semesterOfStudy === semesterOfStudy &&
                    userData.programOfStudy === programOfStudy
                  );
                })
                .map(doc => ({
                  id: doc.id,
                  username: doc.data().username,
                  avatar: logo1,
                  status: doc.data().status,
                }));
  
              setUsers(userList);
            } catch (error) {
              console.error('Error fetching users:', error);
            }
          });
  
          return () => {
            unsubscribe();
          };
        }
      } catch (error) {
        console.error('Error fetching logged-in user details:', error);
      }
    };
  
    fetchUserDetails();
  }, []);  

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  const handleChallengeSend = async () => {
    setIsLoading(true);
    if (selectedUserId && selectedSubject && selectedDifficulty) {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const challengeData = {
            senderId: currentUser.uid,
            receiverId: selectedUserId,
            course: selectedSubject,
            difficulty: selectedDifficulty,
            status: 'pending',
          };
          const challengesCollectionRef = collection(db, 'challenges');
          const docRef = await addDoc(challengesCollectionRef, challengeData);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log('Challenge sent:', challengeData);
          const challengeRef = doc(db, 'challenges', docRef.id);
          const unsubscribe = onSnapshot(challengeRef, async (snapshot) => {
            const challenge = snapshot.data();
            if (challenge.status === 'accepted') {
              try {
                const senderRef = doc(db, 'users', currentUser.uid);
                await updateDoc(senderRef, { status: 'busy' });
                setIsLoading(false);
                unsubscribe(); 
                navigate(`/Quiz2/${docRef.id}?sender=${challenge.senderId}&receiver=${challenge.receiverId}`);
              } catch (error) {
                console.error('Error updating user status:', error);
              }
            } else if (challenge.status === 'declined') {
              setIsLoading(false);
              unsubscribe(); 
              alert('Challenge was declined.');
            }
          });
          setIsModalOpen(false);
        } else {
          console.error('No user is authenticated');
        }
      } catch (error) {
        console.error('Error sending challenge:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedDifficulty('');
    setQuestions([]); 
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    if (courseData[selectedSubject] && courseData[selectedSubject][difficulty]) {
      setQuestions(courseData[selectedSubject][difficulty]);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'online':
        return styles.onlineStatus;
      case 'offline':
        return styles.offlineStatus;
      case 'busy':
        return styles.busyStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const userList = users.map((user) => (
    <li
      key={user.id}
      onClick={() => handleUserSelect(user.id)}
      style={selectedUserId === user.id ? styles.selectedUserItem : styles.userItem}
    >
      <img src={user.avatar} alt={user.username} style={styles.userAvatar} />
      <span style={styles.userName}>{user.username}</span>
      <span style={getStatusStyle(user.status)}>{user.status}</span>
    </li>
  ));

  useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    }, []);
  
  dotStream.register()

  return (
    <div style={styles.challengeScreen}>
        <div style={styles.background}></div>
        <div style={styles.header}>
            <div style={styles.buttonContainer}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <FaArrowCircleLeft size={20} /> Go Back
                </button>
            </div>
            <div style={styles.buttonContain}>
                <button onClick={() => navigate("/received")} style={styles.backButton}>
                    <i className="fa fa-rocket"></i>My Challenges
                </button>
            </div>
            <h1 style={{fontSize: "40px",textAlign: "center",display: "flex",justifyContent: "center",alignItems: "center"}}>Quiz Battle!</h1>
        </div>
                <p style={styles.subtitle}>Select a user to challenge:</p>
                <div style={styles.scrollableContainer}>
                  <div style={styles.content}>
                  {loading ? (
                    <div style={styles.noDataContainer}>
                      <p style={styles.noDataMessage}>Loading competitors<l-dot-stream size="60" speed="2.5"  color="black"></l-dot-stream></p>
                    </div>
                    ) : userList.length > 0 ? (
                      <ul style={styles.userList}>{userList}</ul>
                    ) : (
                      <div style={styles.noDataContainer}>
                        <p style={styles.noDataMessage}>Sorry, no users available for your program of study at the moment. Come back later.</p>
                      </div>
                    )}
                  </div>
                </div>
      <button
        onClick={handleOpenModal}
        disabled={!selectedUserId}
        style={selectedUserId ? styles.challengeButton : styles.disabledButton}
      >
        <FaPaperPlane style={styles.sendIcon} />
        Send Challenge
      </button>
      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Select Subject and Difficulty</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>Select Subject:</label>
              <div style={styles.scrollableList}>
                {Object.keys(courseData).filter((subject) => courseData[subject].programOfStudy === userData.programOfStudy && courseData[subject].semesterOfStudy === userData.semesterOfStudy && courseData[subject].levelOfStudy === userData.levelOfStudy).length > 0 ? (
                  Object.keys(courseData).filter((subject) => courseData[subject].programOfStudy === userData.programOfStudy && courseData[subject].semesterOfStudy === userData.semesterOfStudy && courseData[subject].levelOfStudy === userData.levelOfStudy).map((subject) => (
                  <div
                    key={subject}
                    style={{
                      ...styles.listItem,
                      ...(subject === selectedSubject ? styles.selectedItem : {}),
                    }}
                    onClick={() => handleSubjectChange(subject)}
                  >
                    {subject}
                  </div>
                ))
              ) : (
                <p style={styles.noDataMessage}>No courses available now. Please come back later.</p>
              )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Select Difficulty:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
              >
                <option value="">Choose Difficulty</option>
                {selectedSubject && Object.keys(courseData[selectedSubject]).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleChallengeSend} style={isLoading ? { ...styles.button, ...styles.loadingButton } : styles.button} disabled={isLoading}>
                {isLoading ? (
                    <span style={styles.loadingText}>Please wait while challenge is accepted...</span>
                ) : (
                'Send Challenge'
                )}
            </button>
            <button onClick={handleCloseModal} style={{ ...styles.button, ...styles.closeButton }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
challengeScreen: {
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
noDataContainer: {
  display: "flex",        
  flexDirection: "column",   
  justifyContent: "center",  
  alignItems: "center",      
  padding: "20px",
  textAlign: "center",
  borderRadius: "5px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
  width: "80%",             
  minHeight: "200px",     
  position: "absolute",     
  top: "60%",            
  left: "50%",            
  transform: "translate(-50%, -50%)",
},  
noDataMessage: {
  textAlign: 'center',
  fontSize: "50px",
  fontWeight: "900",
  color: '#000000',
  padding: '20px',
},
header: {
  zIndex: 2,
  width: '95%',
  marginLeft: 'auto',
  marginRight: 'auto',
  backgroundColor: '#FFD700',
  padding: '20px',
  top: '10px',
  borderRadius: '8px 8px 10px 10px',
  position: 'relative',
  opacity: 0.8,
},
backButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "25px",
    margin: '10px',
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.3s",
},
buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "20px",
},
buttonContain: {
    position: "absolute",
    top: "40px",
    right: "20px",
},
content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    padding: '20px',
    marginLeft: '10px',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,         
},
scrollableContainer: {
    flex: 1,     
    marginTop: '10px',      
    marginBottom: '100px',      
    overflowY: 'auto',
    opacity: '0.9',
    width: '100%'
},
subtitle: {
    fontSize: '35px',
    color: '#000000',
    marginBottom: '10px',
    fontWeight: '900'
},
userList: {
    listStyleType: 'none',
    padding: 0,
    marginBottom: '30px',
    width: '100%',
},
userItem: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    opacity: '0.9',
},
selectedUserItem: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    backgroundColor: '#FFD700',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
},
userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '15px',
},
userName: {
    fontSize: '20px',
    fontWeight: 'bold',
},
challengeButton: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease',
    position: 'fixed',
    bottom: 20,
    zIndex: 2,
    width: '80%',
},
disabledButton: {
    padding: '12px 20px',
    backgroundColor: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '20px',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    bottom: 20,
},
sendIcon: {
    marginRight: '8px',
},
modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '600px',
    textAlign: 'center',
    opacity: '0.8',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    marginLeft: '20px',
    transition: 'background-color 0.3s',
  },
  loadingButton: {
    backgroundColor: 'grey',
    cursor: 'not-allowed',
  },
  loadingText: {
    fontSize: '16px',
    color: 'blue',
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  scrollableList: {
    maxHeight: '100px',
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '15px',
    backgroundColor: '#fff',
  },
  listItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.3s ease',
  },
  selectedItem: {
    backgroundColor: '#FFD700',
  },
  userStatus: {
    fontStyle: 'italic',
  },
  onlineStatus: {
    fontStyle: 'italic',
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'green',
    padding:'8px',
    borderRadius: '8px',
  },
  offlineStatus: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: '18px',
    fontWeight: '600',
    backgroundColor: 'red',
    padding:'8px',
    borderRadius: '8px',
  },
  busyStatus: {
    fontStyle: 'italic',
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'orange',
    padding:'10px',
    borderRadius: '8px',
  },
  defaultStatus: {
    color: 'black',
    fontStyle: 'italic',
  },
};
export default ChallengeSendingScreen;