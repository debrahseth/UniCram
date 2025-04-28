import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import logo1 from '../assets/op.jpg';
import logo from '../assets/download.png';
import { dotWave, metronome, spiral, lineSpinner } from 'ldrs'

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: '', email: '', programOfStudy: '', levelOfStudy: '', semesterOfStudy: '' });
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [programLoading, setProgramLoading] = useState(false);
  // const [collegeLoading, setCollegeLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [programOfStudy, setProgramOfStudy] = useState('');
  const [levelOfStudy, setLevelOfStudy] = useState('');
  const [semesterOfStudy, setSemesterOfStudy] = useState('');
  // const [collegeOfStudy, setCollegeOfStudy] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const programs = [
    "Agricultural Engineering",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Electrical and Electronics Engineering",
    "Geological Engineering",
    "Geomatic Engineering",
    "Industrial Engineering",
    "Marine Engineering",
    "Materials Engineering",
    "Mechanical Engineering",
    "Metallurgical Engineering",
    "Petrochemical Engineering",
    "Petroleum Engineering",
    "Telecommunications Engineering",
  ];

  let inactivityTimeout;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserDetails({
              username: userDoc.data().username || currentUser.displayName || 'No Username',
              email: currentUser.email || 'No Email',
              programOfStudy: userDoc.data().programOfStudy || 'No Program of Study',
              semesterOfStudy: userDoc.data().semesterOfStudy || 'No Semester of Study',
              levelOfStudy: userDoc.data().levelOfStudy || 'No Level of Study',
              // collegeOfStudy: userDoc.data().collegeOfStudy || 'No College of Study',
            });
            setProgramOfStudy(userDoc.data().programOfStudy || '');
            setSemesterOfStudy(userDoc.data().semesterOfStudy || '');
            setLevelOfStudy(userDoc.data().levelOfStudy || '');
            // setCollegeOfStudy(userDoc.data().collegeOfStudy || '');
          } else {
            console.log('User document not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserDetails();
    }
  }, [currentUser]);

  dotWave.register()
  spiral.register()
  metronome.register()
  lineSpinner.register()

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          status: 'offline',
        });
      }
      await auth.signOut();
      setLogoutLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error.message);
      setLogoutLoading(false);
    }
  };

  const useInactivityLogout = (timeoutDuration = 300000) => {
    useEffect(() => {
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(handleLogout, timeoutDuration);
      };
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      resetInactivityTimer();
      return () => {
        clearTimeout(inactivityTimeout);
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keydown', resetInactivityTimer);
      };
    }, [timeoutDuration]);
  };
  useInactivityLogout();
  
  const handleUpdateProgramOfStudy = async () => {
    setProgramLoading(true);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          programOfStudy: programOfStudy,
        });
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          programOfStudy: programOfStudy,
        }));
        alert('Program of Study updated');
      }
    } catch (error) {
      console.error('Error updating program of study:', error);
    } finally {
      setProgramLoading(false);
    }
  };

  const handleUpdateLevelOfStudy = async () => {
    setLevelLoading(true);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          levelOfStudy:levelOfStudy,
        });
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          levelOfStudy: levelOfStudy,
        }));
        alert('Level of Study updated');
      }
    } catch (error) {
      console.error('Error updating level of study:', error);
    } finally {
      setLevelLoading(false);
    }
  };

  const handleUpdateSemesterOfStudy = async () => {
    setSemesterLoading(true);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          semesterOfStudy:semesterOfStudy,
        });
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          semesterOfStudy: semesterOfStudy,
        }));
        alert('Semester of Study updated');
      }
    } catch (error) {
      console.error('Error updating semester of study:', error);
    } finally {
      setSemesterLoading(false);
    }
  };

  // const handleUpdateCollegeOfStudy = async () => {
  //   setCollegeLoading(true);
  //   try {
  //     if (currentUser) {
  //       const userDocRef = doc(db, 'users', currentUser.uid);
  //       await updateDoc(userDocRef, {
  //         collegeOfStudy:collegeOfStudy,
  //       });
  //       setUserDetails((prevDetails) => ({
  //         ...prevDetails,
  //         collegeOfStudy: collegeOfStudy,
  //       }));
  //       alert('College of Study updated');
  //     }
  //   } catch (error) {
  //     console.error('Error updating college of study:', error);
  //   } finally {
  //     setCollegeLoading(false);
  //   }
  // };

  const handleRecord = async () => {
    setRecordLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    navigate('/record');
    setRecordLoading(false);
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <p style={{fontSize: '36px', color: 'blue'}}>Loading Profile <l-metronome  size="40"  speed="1.6"   color="blue" ></l-metronome></p>
      </div>
    );
  }

  if (recordLoading) {
    return (
      <div className="spinner-container">
        <p style={{fontSize: '36px', color: 'blue'}}>Loading Records <l-line-spinner size="40" stroke="3" speed="1" color="blue" ></l-line-spinner></p>
      </div>
    );
  }

  if (logoutLoading) {
    return (
      <div className="spinner-container">
        <p>Logging out...</p>
        <l-spiral size="40" speed="0.9"  color="blue"></l-spiral>
      </div>
    );
  }

  return (
    <div style={styles.container}>
        <h3 style={styles.profileTitle}>Profile Details</h3>
        <div style={styles.contain}>
          <div style={styles.profileCard}> 
          <div style={styles.profilePictureContainer}>
          <img
            src={logo}
            alt="Study Group Logo"
            style={styles.profilePicture}
          />
          </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><i className="fa fa-user" style={styles.icon}></i>Username:</label>
              <input
                type="text"
                value={userDetails.username}
                readOnly
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><i className="fa fa-envelope" style={styles.icon}></i>Email:</label>
              <input
                type="email"
                value={userDetails.email}
                readOnly
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><i className="fa fa-building" style={styles.icon}></i>College of Study:</label>
              <input
              value='College of Engineering'
              readOnly
              // onChange={(e) => setCollegeOfStudy(e.target.value)}
              style={styles.programInput}
              />
                {/* <option value="">Select College</option>
                <option value="College of Engineering">College of Engineering</option>
                <option value="College of Science">College of Science</option>
                <option value="College of Health Sciences">College of Health</option>
                <option value="College of Humanities and Social Sciences">College of Social Sciences</option>
                <option value="College of Art and Built Environment">College of Art and Built Environment</option>
                <option value="College of Agriculture and Natural Resources">College of Agriculture and Natural Resources</option>
              </select> */}
            </div>
              {/* <button onClick={handleUpdateCollegeOfStudy} style={styles.updateButton1} disabled={collegeLoading}>
                {collegeLoading ? (
                  <div className="spinner-button"> 
                    Updating <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                  </div>
                ) : (
                  'Update College of Study'
                )}
              </button> */}
                <button onClick={handleRecord} style={styles.recordButton}>
                  <i className="fa fa-trophy"></i> My Achievements <i className="fa fa-trophy"></i>
                </button>
              <div style={styles.update}>
                <button onClick={() => navigate(-1)} style={styles.goBackButton}>
                  <FaArrowLeft style={styles.icon} /> Go Back
                </button>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  <FaSignOutAlt style={styles.icon} /> Logout
                </button>
              </div>
          </div>
          <div style={styles.profileCard}> 
            <div style={styles.profilePictureContainer}>
            <img
              src={logo1}
              alt="Study Group Logo"
              style={styles.profilePicture}
            />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <i className="fa fa-graduation-cap" style={styles.icon}></i>Program of Study:
              </label>
              <div style={styles.dropdownContainer} onClick={() => setIsOpen(!isOpen)}>
                <div style={styles.programInput}>
                  {programOfStudy || "Select Program"}
                </div>
              {isOpen && (
                <div style={styles.dropdownMenu}>
                  {programs.map((program, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.dropdownItem,
                        ...(hoveredIndex === index ? styles.dropdownItemHover : {}),}}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => {
                        setProgramOfStudy(program);
                        setIsOpen(false);
                      }}
                    >
                      {program}
                    </div>
                  ))}
                </div>
              )}
            </div> 
          </div>              
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-list-ol" style={styles.icon}></i>Level of Study:
            </label>
            <select
              value={levelOfStudy}
              onChange={(e) => setLevelOfStudy(e.target.value)}
              style={styles.programInput}
            >
              <option value="">Select Level</option>
              <option value="Level 100">Level 100</option>
              <option value="Level 200">Level 200</option>
              <option value="Level 300">Level 300</option>
              <option value="Level 400">Level 400</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-calendar" style={styles.icon}></i>Semester of Study:
            </label>
            <select
              value={semesterOfStudy}
              onChange={(e) => setSemesterOfStudy(e.target.value)}
              style={styles.programInput}
            >
              <option value="">Select Semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          <button onClick={handleUpdateProgramOfStudy} style={styles.updateButton2} disabled={programLoading}>
            {programLoading ? (
              <div className="spinner-button"> 
                Updating <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
              </div>
            ) : (
              'Update Program of Study'
            )}
          </button>
          <div style={styles.update}>
          <button onClick={handleUpdateLevelOfStudy} style={styles.updateButton} disabled={levelLoading}>
          {levelLoading ? (
            <div className="spinner-button"> 
              Updating <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
            </div>
          ) : (
            'Update Level of Study'
          )}
          </button>
          <button onClick={handleUpdateSemesterOfStudy} style={styles.updateButton} disabled={semesterLoading}>
            {semesterLoading ? (
              <div className="spinner-button"> 
                Updating <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
              </div>
            ) : (
              'Update Semester of Study'
            )}
          </button>
          </div>
        </div>
      </div> 
        <div style={styles.footer}>
          <p>© 2025 Prime Academy. All rights reserved.</p>
        </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f4f7fc',
    display: 'flex',
    height: '90vh',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contain: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', 
    width: '100%',
    height: '80vh',
    padding: '20px',
    boxSizing: 'border-box',
  },  
  logoutButton: {
    backgroundColor: '#FF4C4C',
    padding: '10px 20px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '48%',
  },
  dropdownContainer: {
    width: "96.5%",
    fontSize: "20px",
    borderRadius: "5px",
    backgroundColor: "white",
    cursor: "pointer",
    position: "relative",
  },
  dropdownMenu: {
    position: "absolute",
    width: "103%",
    maxHeight: "150px",
    overflowY: "auto",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.3s ease",
  },
  dropdownItemHover: {
    backgroundColor: "#f0f0f0",
  },
  recordButton: {
    backgroundColor: '#FFD700',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '10px 15px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    gap: '10px',
    transition: 'background-color 0.3s',
    width: '100%',
    fontWeight: '800',
    marginTop: '10px',
    justifyContent: 'center',
  },  
  goBackButton: {
    backgroundColor: '#4CAF50',
    padding: '10px 20px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '48%',
  },
  updateButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '48%',
  },
  updateButton1: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  },
  updateButton2: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  },
  update: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', 
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    width: '48%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
  },
  profileTitle: {
    textAlign: 'center',
    fontSize: '40px',
    fontWeight: '900px',
    color: '#333',
    marginBottom: '5px',
  },
  profilePictureContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  profilePicture: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  inputGroup: {
    marginBottom: '10px',
    width: '100%',
  },
  input: {
    width: '96%',
    padding: '12px',
    fontSize: '20px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f4f7fc',
    cursor: 'not-allowed',
    marginTop: '10px'
  },
  programInput: {
    width: '96%',
    padding: '12px',
    fontSize: '20px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f4f7fc',
    cursor: 'text',
    marginTop: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  buttonContainer: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#fff',
    padding: '10px 0',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  label:{
    fontSize: '20px',
  },
  icon: {
    fontSize: '15px',
    marginRight: '8px',
  },
  footer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    padding: '15px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontFamily: 'Poppins, sans-serif',
  },
};

export default Profile;
