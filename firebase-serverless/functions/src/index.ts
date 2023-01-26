import { https, Request } from "firebase-functions";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ensureAuthenticated } from "./middleware/auth";

admin.initializeApp();

exports.createUser = https.onCall(async (data: any) => {
  const { name, email, password } = data;

  const nameType = typeof name === "string" && name.length > 0;
  const emailType = typeof email === "string" && email.length > 0;
  const passwordType = typeof password === "string" && password.length > 0;

  if (!(nameType && emailType && passwordType)) {
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
    email,
    password: passwordEncripted,
  });

  return {
    success: true,
    message: "User created with success",
    result: (await writeResult.get()).data(),
  };
});

exports.login = https.onCall(async (data: any) => {
  const { email, password } = data;

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

  const userLogged = {
    id: userLoggedRef.docs[0].id,
    ...userLoggedRef.docs[0].data(),
  };

  return {
    success: true,
    message: "User logged with success",
    result: userLogged,
  };
});

exports.addNote = https.onCall(async (data: any) => {
  console.log(data);
  const userData = await ensureAuthenticated(data.token);

  if (!userData) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const { userId, taskText } = data;

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

  return {
    success: true,
    message: "User created with success",
    result: (await writeResult.get()).data(),
  };

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

exports.listAllNotesByUser = https.onCall(async (data: any) => {
  const {user: userString } = await ensureAuthenticated(data.token);

  const user = JSON.parse(userString);

  if (!user) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const userExists = await admin.firestore().doc(`users/${user.id}`).get();

  if (!userExists.exists) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }

  try {
    const notesRef = await admin
      .firestore()
      .collection("notes")
      .where("userId", "==", user.id)
      .get();

    const [notesData] = await Promise.all([
      notesRef.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        };
      }),
    ]);

    return {
      success: true,
      message: "User created with success",
      result: notesData,
    };
  } catch (error) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }
});

exports.deleteNoteByUser = https.onCall(async (data: any) => {
  const { user: userString } = await ensureAuthenticated(data.token);
  const { id } = data;

  const user = JSON.parse(userString);

  if (!user) {
    throw new https.HttpsError("unauthenticated", "User is not logged in");
  }

  const userExists = await admin.firestore().doc(`users/${user.id}`).get();

  if (!userExists.exists) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }

  const noteExists = await admin.firestore().doc(`notes/${id}`).get();

  if (!noteExists.exists) {
    throw new https.HttpsError("not-found", "Note does not exists");
  }

  try {
    await noteExists.ref.delete();

    return {
      success: true,
      message: "User created with success",
    }
  } catch (error) {
    throw new https.HttpsError("not-found", "User logged does not exists");
  }
});
