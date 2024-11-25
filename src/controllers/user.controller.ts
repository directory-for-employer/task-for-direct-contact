import { IDataClient, IUserName } from "../interface/product.interface";
import { TypedRequestBody } from "../utils/utils";
import { prisma } from "../../prisma/prisma-client";

import { Response } from "express";

import axios from "axios";

interface IData {
  token: string;
}

interface IUserIds {
  id: number;
}

class UserController {
  async auth(username: string) {
    if (!username) {
      throw new Error("Нету данных");
    }

    const { data } = await axios({
      method: "POST",
      url: "http://94.103.91.4:5000/auth/login",
      data: {
        username: `${username}`,
      },
    });
    const { token } = data;
    return token;
  }

  // Создание пользователя
  async registration(req: TypedRequestBody<IUserName>, res: Response) {
    const { name } = req.body;
    if (!name) {
      return res.status(404).json({ message: "Данные не пришли" });
    }

    const { data } = await axios<IData>({
      method: "POST",
      url: "http://94.103.91.4:5000/auth/registration",
      data: {
        username: `${name}`,
      },
    });

    if (!data) {
      return res.status(400).json({ message: "Данные не пришли" });
    }

    await prisma.user.create({
      data: {
        name,
        token: data.token,
      },
    });

    return res.status(200).json({ message: "Функция отработала успешно" });
  }

  // Принятие клиентов через api
  async takeUser(req: TypedRequestBody<IUserName>, res: Response) {
    const { name } = req.body;

    if (!name) {
      return res.status(404).json({ message: "Данные не пришли" });
    }

    const userExist = await prisma.user.findFirst({
      where: {
        name,
      },
    });

    if (!userExist) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // take Clients
    const { data, status } = await axios<IDataClient[]>({
      method: "GET",
      url: "http://94.103.91.4:5000/clients",
      headers: {
        Authorization: `${userExist.token}`,
      },
    });

    if (status === 401) {
      const token = await this.auth(name);

      const { data } = await axios<IDataClient[]>({
        method: "GET",
        url: "http://94.103.91.4:5000/clients",
        headers: {
          Authorization: `${token}`,
        },
      });
      data.map(
        async (i) =>
          await prisma.client.createMany({
            data: [
              {
                id: i.id,
                firstName: i.firstName,
                lastName: i.lastName,
                gender: i.gender,
                address: i.address,
                city: i.city,
                phone: i.phone,
                email: i.email,
              },
            ],
          }),
      );
      return res
        .status(200)
        .json({ message: "Функция отработала успешно, после 401 ошибки" });
    }

    data.map(
      async (i) =>
        await prisma.client.createMany({
          data: [
            {
              id: i.id,
              firstName: i.firstName,
              lastName: i.lastName,
              gender: i.gender,
              address: i.address,
              city: i.city,
              phone: i.phone,
              email: i.email,
            },
          ],
        }),
    );

    return res.status(200).json({ message: "Функция отработала успешно" });
  }
  // обновление статуса у клиентов
  async upDateStatus(req: TypedRequestBody<IUserName>, res: Response) {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Данные не пришли" });
    }

    // у меня почему то здесь не работает функция auth пришлось в ручную писать
    const { data: t } = await axios({
      method: "POST",
      url: "http://94.103.91.4:5000/auth/login",
      data: {
        username: `${name}`,
      },
    });
    const { token } = t;

    // take and send id`s
    let listIds: number[] = [];
    const UserIds: IUserIds[] = await prisma.client.findMany({
      select: {
        id: true,
      },
    });

    UserIds.map((i) => listIds.push(i.id));
    const { data: UserIdStat } = await axios<IDataClient[]>({
      method: "POST",
      url: "http://94.103.91.4:5000/clients",
      data: {
        userIds: listIds,
      },
      headers: {
        Authorization: `${token}`,
      },
    });

    UserIdStat.map(
      async (i) =>
        await prisma.client.updateMany({
          where: {
            id: i.id,
          },
          data: {
            status: i.status,
          },
        }),
    );
    return res.status(200).json({ message: "Функция отработала успешно" });
  }
}

export default new UserController();
