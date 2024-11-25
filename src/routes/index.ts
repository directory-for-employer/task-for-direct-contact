import express from "express";
import { UserController } from "../controllers";

export const routes = express.Router();

// user

// создание пользователя
routes.post("/reg", UserController.registration);

// получение клиентов
routes.post("/take-user", UserController.takeUser);

// обновление статусов клиента
routes.post("/update-status", UserController.upDateStatus);
