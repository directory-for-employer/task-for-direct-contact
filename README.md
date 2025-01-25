## В данном репозитории было реализован сервис:
  * По регистарции
  * Авторизации по токену.
  * Получение данных через API
  * Обновление данных по полученным данным из API 

### База данных SQL-Lite с заполнеными данными находится по пути */prisma/dev.db*

### Для запуска вам понадобиться установить зависимости *npm i*
### Далее вам понадобиться миграция с prisma 
  * *npx prisma init --datasource-provider sqlite*
  * *npx prisma migrate dev --name init*
  * *npx prisma generate*

#### Выполнен код на nodejs + express + prisma + typescript 
