import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Generation {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: any;
}

export interface ProjectData {
  id?: string;
  userId: string;
  name: string;
  originalImageUrl: string;
  generations?: Generation[]; // Array of generated versions
  analysis?: any; // Now optional as it's fetched async
  costEstimate?: string; // Now optional
  createdAt?: any;
  products?: any[]; // Shopping list items
}

export async function saveProject(data: ProjectData) {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

export async function getUserProjects(userId: string): Promise<ProjectData[]> {
  try {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProjectData));
  } catch (e) {
    console.error("Error fetching projects: ", e);
    return [];
  }
}

export async function getProject(projectId: string): Promise<ProjectData | null> {
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ProjectData;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error fetching project: ", e);
    return null;
  }
}

export async function updateProject(projectId: string, data: Partial<ProjectData>) {
  try {
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, data);
  } catch (e) {
    console.error("Error updating project: ", e);
    throw e;
  }
}

export async function deleteProject(projectId: string) {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (e) {
    console.error("Error deleting project: ", e);
    throw e;
  }
}
