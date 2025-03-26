// services/mockDataService.js
import { db } from '../firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

// Helper to fetch all documents from a collection
const fetchCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Admin Functions
export const getAllMentors = async () => {
  return await fetchCollection('mentors');
};

export const getAllMentees = async () => {
  return await fetchCollection('mentees');
};

export const createMentor = async (mentorData) => {
  const newMentor = {
    ...mentorData,
    profileImage: 'https://via.placeholder.com/40',
    mentees: [],
  };
  console.log('newMentor', newMentor);
  const docRef = await addDoc(collection(db, 'mentors'), newMentor);
  console.log('docRef', doc)
  return { ...newMentor, id: docRef.id };
};


export const createMentee = async (menteeData) => {
  try {
    console.log('Mentee Data:', menteeData);

    // Create a new mentee document
    const newMentee = {
      ...menteeData,
      profileImage: 'https://via.placeholder.com/40',
      attendance: 100,
    };

    // Add the mentee to Firestore (ID is auto-generated)
    const docRef = await addDoc(collection(db, 'mentees'), newMentee);
    console.log('New Mentee ID:', docRef.id);

    // Fetch the mentor document using menteeData.mentorId
    const mentorRef = doc(db, 'mentors', menteeData.mentorId);
    const mentorDoc = await getDoc(mentorRef);

    if (mentorDoc.exists()) {
      const mentorData = mentorDoc.data();

      // Ensure mentees array exists
      const updatedMentees = mentorData.mentees ? [...mentorData.mentees, docRef.id] : [docRef.id];

      // Update the mentor's mentees list
      await updateDoc(mentorRef, { mentees: updatedMentees });
      console.log(`Mentor (${menteeData.mentorId}) updated with new mentee: ${docRef.id}`);
    } else {
      console.warn(`Mentor with ID ${menteeData.mentorId} not found.`);
    }

    return { ...newMentee, id: docRef.id };
  } catch (error) {
    console.error('Error creating mentee:', error);
    throw error;
  }
};

export const deleteMentor = async (mentorId) => {
  await deleteDoc(doc(db, 'mentors', mentorId));
};

export const deleteMentee = async (menteeId) => {
  const menteeDoc = await getDoc(doc(db, 'mentees', menteeId));
  if (menteeDoc.exists()) {
    const menteeData = menteeDoc.data();
    const mentorRef = doc(db, 'mentors', menteeData.mentorId);
    const mentorDoc = await getDoc(mentorRef);
    if (mentorDoc.exists()) {
      const mentorData = mentorDoc.data();
      await updateDoc(mentorRef, {
        mentees: mentorData.mentees.filter((id) => id !== menteeId),
      });
    }
    await deleteDoc(doc(db, 'mentees', menteeId));
  }
};

export const getMentorById = async (mentorId) => {
  const docRef = doc(db, 'mentors', mentorId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Existing Functions Updated for Firestore
export const getChatsForUser = async (userId, userRole) => {
  const chats = await fetchCollection('chats');
  const filteredChats = chats.filter((chat) => {
    if (userRole === 'mentor') {
      return chat.participants.includes(userId) || chat.type === 'group';
    } else {
      return (
        chat.participants.includes(userId) &&
        (chat.type === 'group' || chat.participants.includes('m1'))
      );
    }
  });

  // Fetch messages for each chat
  for (let chat of filteredChats) {
    const messagesSnapshot = await getDocs(
      collection(db, 'chats', chat.id, 'messages')
    );
    chat.messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  return filteredChats;
};

export const getMenteesForMentor = async (mentorId) => {
  const mentees = await fetchCollection('mentees');
  return mentees.filter((mentee) => mentee.mentorId === mentorId);
};

export const getMenteeById = async (menteeId) => {
  const docRef = doc(db, 'mentees', menteeId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getMenteeByEmail = async (email) => {
  const mentees = await fetchCollection('mentees');
  return mentees.find((mentee) => mentee.email === email) || null;
};

export const getLeaveApplicationsForMentor = async (mentorId) => {
  const mentorMentees = await getMenteesForMentor(mentorId);
  const menteeIds = mentorMentees.map((mentee) => mentee.id);
  const leaveApps = await fetchCollection('leaveApplications');
  return leaveApps.filter((app) => menteeIds.includes(app.menteeId));
};

export const getLeaveApplicationsForMentee = async (menteeId) => {
  const leaveApps = await fetchCollection('leaveApplications');
  return leaveApps.filter((app) => app.menteeId === menteeId);
};

export const submitLeaveApplication = async (application) => {
  const newApplication = {
    ...application,
    id: `la${(await getDocs(collection(db, 'leaveApplications'))).docs.length + 1}`,
    status: 'pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };
  const docRef = await addDoc(collection(db, 'leaveApplications'), newApplication);
  return { ...newApplication, id: docRef.id };
};

export const updateLeaveApplicationStatus = async (applicationId, status) => {
  const docRef = doc(db, 'leaveApplications', applicationId);
  await updateDoc(docRef, { status });
  const updatedDoc = await getDoc(docRef);
  return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
};

// New function to send a message in a chat
export const sendMessage = async (chatId, message) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const newMessage = {
    ...message,
    id: (await getDocs(messagesRef)).docs.length + 1,
    timestamp: new Date().toISOString(),
  };
  await addDoc(messagesRef, newMessage);
  return newMessage;
};