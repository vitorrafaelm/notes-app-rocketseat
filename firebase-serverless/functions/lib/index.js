"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_1 = require("firebase-functions");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./middleware/auth");
firebase_admin_1.default.initializeApp();
exports.createUser = firebase_functions_1.https.onCall(async (data) => {
    const { name, username, email, password } = data;
    const nameType = typeof name === "string" && name.length > 0;
    const usernameType = typeof username === "string" && username.length > 0;
    const emailType = typeof email === "string" && email.length > 0;
    const passwordType = typeof password === "string" && password.length > 0;
    if (!(nameType && usernameType && emailType && passwordType)) {
        throw new firebase_functions_1.https.HttpsError("invalid-argument", "The function must me called with the correct arguments");
    }
    const userAlreadyExists = await firebase_admin_1.default
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get();
    if (!userAlreadyExists.empty) {
        throw new firebase_functions_1.https.HttpsError("already-exists", "User already registered on the database, verify if your email is correct");
    }
    const salt = bcryptjs_1.default.genSaltSync(10);
    const passwordEncripted = bcryptjs_1.default.hashSync(password, salt);
    const writeResult = await firebase_admin_1.default.firestore().collection("users").add({
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
exports.login = firebase_functions_1.https.onRequest(async (req, res) => {
    const { email, password } = req.body.data;
    const emailType = typeof email === "string" && email.length > 0;
    if (!emailType) {
        throw new firebase_functions_1.https.HttpsError("invalid-argument", "The function must me called with the correct arguments");
    }
    const userExists = await firebase_admin_1.default
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get();
    if (userExists.empty) {
        throw new firebase_functions_1.https.HttpsError("already-exists", "User does not exists");
    }
    const passwordCorrect = await bcryptjs_1.default.compare(password, await userExists.docs[0].data().password);
    if (!passwordCorrect) {
        throw new firebase_functions_1.https.HttpsError("unauthenticated", "Incorrect informations");
    }
    const token = jsonwebtoken_1.default.sign({ user: JSON.stringify({ email, id: userExists.docs[0].id }) }, "7783698978206a7dab23a62285724408", { expiresIn: "1d" });
    await userExists.docs[0].ref.update({ token });
    const userLoggedRef = await firebase_admin_1.default
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
exports.addNote = firebase_functions_1.https.onRequest(async (req, res) => {
    const userData = await (0, auth_1.ensureAuthenticated)(req);
    if (!userData) {
        throw new firebase_functions_1.https.HttpsError("unauthenticated", "User is not logged in");
    }
    const { userId, taskText } = req.body.data;
    const userIdType = typeof userId === "string" && userId.length > 0;
    if (!userIdType) {
        throw new firebase_functions_1.https.HttpsError("invalid-argument", "The function must me called with the correct arguments");
    }
    const userExists = await firebase_admin_1.default.firestore().doc(`users/${userId}`).get();
    if (!userExists.exists) {
        throw new firebase_functions_1.https.HttpsError("not-found", "User logged does not exists");
    }
    const note = {
        userId,
        taskText,
        done: false,
    };
    const writeResult = await firebase_admin_1.default
        .firestore()
        .collection("notes")
        .add(Object.assign({}, note));
    const response = {
        success: true,
        message: "User created with success",
        result: (await writeResult.get()).data(),
    };
    res.json(response);
});
exports.changeNoteStatus = firebase_functions_1.https.onRequest(async (req, res) => {
    const { userId, noteId, done } = req.body.data;
    const isUserLogged = await (0, auth_1.ensureAuthenticated)(req);
    if (!isUserLogged) {
        throw new firebase_functions_1.https.HttpsError("unauthenticated", "User is not logged in");
    }
    const userExists = await firebase_admin_1.default.firestore().doc(`users/${userId}`).get();
    if (!userExists.exists) {
        throw new firebase_functions_1.https.HttpsError("not-found", "User logged does not exists");
    }
    let noteToUpdate = await firebase_admin_1.default
        .firestore()
        .collection("notes")
        .doc(noteId)
        .get();
    await noteToUpdate.ref.update({ done });
    noteToUpdate = await firebase_admin_1.default
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
exports.listAllNotesByUser = firebase_functions_1.https.onRequest(async (req, res) => {
    const { userId } = req.body.data;
    const isUserLogged = await (0, auth_1.ensureAuthenticated)(req);
    if (!isUserLogged) {
        throw new firebase_functions_1.https.HttpsError("unauthenticated", "User is not logged in");
    }
    const userExists = await firebase_admin_1.default.firestore().doc(`users/${userId}`).get();
    if (!userExists.exists) {
        throw new firebase_functions_1.https.HttpsError("not-found", "User logged does not exists");
    }
    try {
        const notesRef = await firebase_admin_1.default
            .firestore()
            .collection("notes")
            .where("userId", "==", userId)
            .get();
        const [notesData] = await Promise.all([
            notesRef.docs.map((doc) => {
                return Object.assign({ id: doc.id }, doc.data());
            }),
        ]);
        const response = {
            success: true,
            message: "User created with success",
            result: notesData,
        };
        res.json(response);
    }
    catch (error) {
        throw new firebase_functions_1.https.HttpsError("not-found", "User logged does not exists");
    }
});
//# sourceMappingURL=index.js.map