import { io } from "socket.io-client";

// local
// export const BaseURL = 'http://localhost:4000';

// live
export const BaseURL = 'https://chartapp-expressjs-backend.onrender.com/';


export const socket = io(BaseURL);