# бэкенд проекта MEsto

### работу выполнил Муругов Дмитрий

## Доступ к проекту:

Адрес сервера по публичному ip:
http://84.201.133.111/
и по домену c `https`, `http`
https://api.dimamurugov.students.nomoreparties.co/

роутеры

- (get) /cards - получить список карт
- (get) /cards/:id - получить информацию о карте по id
- (post) /cards - создать карточку с свойствами в body: `name`, `link`
- (delete) /cards/:id - удалить карточку по id
- (put) /cards/:id/likes - поставить лайк карточке
- (delete)/cards/:id/likes - удалить дайк карточке

- (get) /users - получить списко пользователей
- (get) /users/:id - получить пользователя по id
- (patch) /users/me - обновить информацию о себе с полями `name`, `about`
- (patch) /users/me/avatar - обновить мою аватарку
  
- (post) /signin - залогинется с поллями `email`, `password`
- (post /signup - зарегистрировать нового пользователя с полями  `name`, `about`, `avatar`,`email`, `password`

## Инструкция по запуску проекта локально:

1. Склонируйте репозиторий себе на компьютер
2. Запустите в терменаре сервер mongodb командрой `mongod`
   затем в IDE наберите команду `npm run dev`

### Версия: v0.0.1
