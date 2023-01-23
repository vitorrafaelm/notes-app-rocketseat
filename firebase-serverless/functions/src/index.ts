import { https } from "firebase-functions";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ensureAuthenticated } from "./middleware/auth";

admin.initializeApp();

exports.createUser = https.onCall(async (data: any) => {
  const { name, username, email, password } = data;

  const nameType = typeof name === "string" && name.length > 0;
  const usernameType = typeof username === "string" && username.length > 0;
  const emailType = typeof email === "string" && email.length > 0;
  const passwordType = typeof password === "string" && password.length > 0;

  if (!(nameType && usernameType && emailType && passwordType)) {
    throw new https.HttpsError(
      "invalid-argument",
      "The function must me called with the correct arguments"
    );
  }

  const userAlreadyExists = await admin
    .firestore()
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!userAlreadyExists.empty) {
    throw new https.HttpsError(
      "already-exists",
      "User already registered on the database, verify if your email is correct"
    );
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordEncripted = bcrypt.hashSync(password, salt);

  const writeResult = await admin.firestore().collection("users").add({
    name,
    username,
    email,
    password: passwordEncripted,
  });

  return {
    success: true,
    message: "User created with success",
    result: (await writeResult.get()).data(),
  };
});

exports.login = https.onRequest(async (req: any, res: any) => {
  const { email, password } = req.body.data;

  const emailType = typeof email === "string" && email.length > 0;

  if (!emailType) {
    throw new https.HttpsError(
      "invalid-argument",
      "The function must me called with the correct arguments"
    );
  }

  const userExists = await admin
    .firestore()
    .collection("users")
    .where("email", "==", email)
    .get();

  if (userExists.empty) {
    throw new https.HttpsError("already-exists", "User does not exists");
  }

  const passwordCorrect = await bcrypt.compare(
    password,
    await userExists.docs[0].data().password
  );

  if (!passwordCorrect) {
    throw new https.HttpsError("unauthenticated", "Incorrect informations");
  }

  const token = jwt.sign(
    { user: JSON.stringify({ email, id: userExists.docs[0].id }) },
    "7783698978206a7dab23a62285724408",
    { expiresIn: "1d" }
  );

  await userExists.docs[0].ref.update({ token });

  const userLoggedRef = await admin
    .firestore()
    .collection("users")
    .where("email", "==", email)
    .get();

  const userLogged = userLoggedRef.docs[0].data();

  const response = {
    success: true,
    message: "User created with success",
    result: userLogged,
  };

  res.json(response);
});

exports.addNote = https.onRequest(async (req: any, res: any) => {
  const userData = await ensureAuthenticated(req);

  if (!userData) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const { userId, taskText } = req.body.data;

  const userIdType = typeof userId === "string" && userId.length > 0;

  if (!userIdType) {
    throw new https.HttpsError(
      "invalid-argument",
      "The function must me called with the correct arguments"
    );
  }

  const userExists = await admin.firestore().doc(`users/${userId}`).get();

  if (!userExists.exists) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }

  const note = {
    userId,
    taskText,
    done: false,
  };

  const writeResult = await admin
    .firestore()
    .collection("notes")
    .add({
      ...note,
    });

  const response = {
    success: true,
    message: "User created with success",
    result: (await writeResult.get()).data(),
  };

  res.json(response);
});

exports.changeNoteStatus = https.onRequest(async (req: any, res: any) => {
  const { userId, noteId, done } = req.body.data;
  const isUserLogged = await ensureAuthenticated(req);

  if (!isUserLogged) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const userExists = await admin.firestore().doc(`users/${userId}`).get();

  if (!userExists.exists) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }

  let noteToUpdate = await admin
    .firestore()
    .collection("notes")
    .doc(noteId)
    .get();

  await noteToUpdate.ref.update({ done });

  noteToUpdate = await admin
    .firestore()
    .collection("notes")
    .doc(noteId)
    .get();

  const response = {
    success: true,
    message: "User created with success",
    result: noteToUpdate.data(),
  };

  res.json(response);
});

exports.listAllNotesByUser = https.onRequest(async (req: any, res: any) => {
  const { userId } = req.body.data;
  const isUserLogged = await ensureAuthenticated(req);

  if (!isUserLogged) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const userExists = await admin.firestore().doc(`users/${userId}`).get();

  if (!userExists.exists) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }

  try {
    const notesRef = await admin
      .firestore()
      .collection("notes")
      .where("userId", "==", userId)
      .get();

    const [notesData] = await Promise.all([
      notesRef.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        };
      }),
    ]);

    const response = {
      success: true,
      message: "User created with success",
      result: notesData,
    };

    res.json(response);
  } catch (error) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }
});
