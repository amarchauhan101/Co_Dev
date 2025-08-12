// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { storage } from "../../firebase"; // adjust path accordingly

// export const uploadFileToFirebase = async (file) => {
//   return new Promise((resolve, reject) => {
//     const fileRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
//     const uploadTask = uploadBytesResumable(fileRef, file);

//     uploadTask.on(
//       "state_changed",
//       null,
//       (error) => reject(error),
//       async () => {
//         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//         resolve(downloadURL);
//       }
//     );
//   });
// };

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase"; // ✅ correct relative path

// export const uploadFileToFirebase = async (file) => {
//     console.log("filename ",file.name);
//   return new Promise((resolve, reject) => {
//     const fileRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
//     const uploadTask = uploadBytesResumable(fileRef, file);

//     uploadTask.on(
//       "state_changed",
//       null,
//       (error) => reject(error),
//       async () => {
//         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//         resolve(downloadURL);
//       } 
//     );
//   });
// };

export const uploadFileToFirebase = async (file) => {
  console.log("🟡 Uploading file:", file.name);

  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("🔴 Upload failed:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("🟢 File uploaded successfully:", downloadURL);
          resolve(downloadURL);
        } catch (err) {
          console.error("🔴 Failed to get download URL:", err);
          reject(err);
        }
      }
    );
  });
};
