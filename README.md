## Установка и запуск

### 1. Установите Node.js и Git

- [Node.js LTS](https://nodejs.org) — скачайте и установите
- [Git](https://git-scm.com/downloads) — скачайте и установите

Проверьте в терминале:

```bash
node -v
git --version
```

### 2. Клонируйте репозиторий

```bash
git clone https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ.git
cd ВАШ_РЕПОЗИТОРИЙ
```

### 3. Установите зависимости

```bash
npm install
```

### 4. Запустите приложение

```bash
npx expo start
```

Установите **Expo Go** на телефон ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)), подключите телефон и компьютер к **одной Wi-Fi сети** и отсканируйте QR-код. 

## Если регистрация в приложении не работает, включите VPN!

---

## Загрузка на GitHub

> **GitHub не открывается или регистрация не проходит? Включите VPN** — часть провайдеров блокирует доступ к сайту.

### 1. Зарегистрируйтесь и создайте репозиторий

1. Перейдите на [github.com](https://github.com) → **Sign up**
2. После входа: **+** → **New repository** → укажите название → **Create repository**
3. Скопируйте URL репозитория

### 2. Загрузите проект

Выполните в папке проекта:

```bash
git init
git config --global user.name "Имя"
git config --global user.email "email@example.com"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ЛОГИН/РЕПО.git
git push -u origin main
```

При запросе пароля введите **Personal Access Token** (не пароль от аккаунта).
Получить токен: GitHub → Settings → Developer settings → Personal access tokens → Generate new token → scope `repo`.

### 3. Обновление после изменений

```bash
git add .
git commit -m "Описание изменений"
git push
```

---

## Структура проекта

```
app/
├── (tabs)/       # Экраны с навигацией (exchange, rates, history, profile...)
├── login.tsx     # Вход
├── register.tsx  # Регистрация
└── api.ts        # API-клиент
components/       # Переиспользуемые компоненты
constants/        # Тема и цвета
hooks/            # useResponsive и др.
```
