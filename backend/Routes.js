import express from 'express';
import { signup, login, getIntern, getInterns } from './AuthController.js';
import { protect, isAdmin, authorization } from './middleware.js';


const Route = express.Router();

Route.post('/admin/signup', signup);
Route.post('/admin/login', login);
Route.post('/getIntern', getIntern);
Route.get('/admin/getInterns', protect,authorization('admin', 'superadmin', 'manager'), getInterns);

export default Route;


