import { collection, getDocs, addDoc, query, where, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const fetchRumors = async (selectedOrg) => {
  try {
    const q = query(collection(db, 'rumors'), where('organization', '==', selectedOrg));
    const querySnapshot = await getDocs(q);
    const rumorsMap = new Map();
    querySnapshot.docs.forEach(doc => {
      const rumor = doc.data();
      const rumorId = doc.id;
      if (rumorsMap.has(rumor.referenceId)) {
        const existingRumor = rumorsMap.get(rumor.referenceId);
        if (rumor.isVariation) {
          existingRumor.variations.push(rumor);
        } else {
          existingRumor.similarSubmissions.push(rumor);
        }
        existingRumor.buzzScore += rumor.buzzScore || 0;
      } else {
        rumorsMap.set(rumor.referenceId, {
          ...rumor,
          id: rumorId,
          buzzScore: rumor.buzzScore || 0,
          variations: rumor.isVariation ? [rumor] : [],
          similarSubmissions: !rumor.isVariation ? [rumor] : []
        });
      }
    });
    return Array.from(rumorsMap.values());
  } catch (error) {
    console.error("Error fetching rumors:", error);
    throw error;
  }
};

export const addNewRumor = async (newRumor) => {
  try {
    return await addDoc(collection(db, 'rumors'), newRumor);
  } catch (error) {
    console.error("Error adding new rumor:", error);
    throw error;
  }
};

export const updateExistingRumor = async (existingRumorId, newRumor) => {
  try {
    const existingRumorRef = doc(db, 'rumors', existingRumorId);
    const existingRumorDoc = await getDoc(existingRumorRef);
    if (existingRumorDoc.exists()) {
      const existingRumorData = existingRumorDoc.data();
      const updatedVariations = [...(existingRumorData.variations || []), newRumor];
      const updatedBuzzScore = (existingRumorData.buzzScore || 0) + 1;
      await updateDoc(existingRumorRef, {
        variations: updatedVariations,
        buzzScore: updatedBuzzScore,
      });
    } else {
      throw new Error(`Rumor with ID ${existingRumorId} does not exist.`);
    }
  } catch (error) {
    console.error("Error updating existing rumor:", error);
    throw error;
  }
};

export const updateUserTeaScore = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentTeaScore = userDoc.data().teaScore || 0;
    await updateDoc(userRef, {
      teaScore: currentTeaScore + 1
    });
  } catch (error) {
    console.error("Error updating user tea score:", error);
    throw error;
  }
};

// New function to update the user's username
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const fetchOrganizations = async () => {
  try {
    const orgSnapshot = await getDocs(collection(db, 'organizations'));
    return orgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};

export const addOrganization = async (orgData) => {
  try {
    return await addDoc(collection(db, 'organizations'), orgData);
  } catch (error) {
    console.error("Error adding organization:", error);
    throw error;
  }
};

export const updateOrganization = async (orgId, orgData) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, orgData);
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

export const deleteOrganization = async (orgId) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await deleteDoc(orgRef);
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
};

export const fetchUserSubmissions = async (userId) => {
  try {
    const q = query(collection(db, 'rumors'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    throw error;
  }
};

export const updateRumorStatus = async (rumorId, newStatus) => {
  try {
    const rumorRef = doc(db, 'rumors', rumorId);
    await updateDoc(rumorRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating rumor status:", error);
    throw error;
  }
};

export const addComment = async (rumorId, commentData) => {
  try {
    const rumorRef = doc(db, 'rumors', rumorId);
    const rumorDoc = await getDoc(rumorRef);
    if (rumorDoc.exists()) {
      const currentComments = rumorDoc.data().comments || [];
      await updateDoc(rumorRef, {
        comments: [...currentComments, commentData]
      });
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const fetchRumorDetails = async (rumorId) => {
  try {
    const rumorDoc = await getDoc(doc(db, 'rumors', rumorId));
    return rumorDoc.exists() ? { id: rumorDoc.id, ...rumorDoc.data() } : null;
  } catch (error) {
    console.error("Error fetching rumor details:", error);
    throw error;
  }
};
