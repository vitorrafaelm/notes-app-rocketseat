import axios from 'axios'; 

const apiFirebase = axios.create({
    baseURL: 'http://127.0.0.1:5001/notes-app-19b55/us-central1/', 
}); 

export { apiFirebase };