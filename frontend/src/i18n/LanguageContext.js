import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const UK_TO_EN = {
    'Головна': 'Home',
    'Всі опитування': 'All surveys',
    'Публічні опитування': 'Public surveys',
    'Мої опитування': 'My surveys',
    'Створити опитування': 'Create survey',
    'Створити нове опитування': 'Create a new survey',
    'Користувачі': 'Users',
    'Управління базою даних': 'Database management',
    'Керування базою даних': 'Database management',
    'Панель керування': 'Dashboard',
    'Налаштування': 'Settings',
    'Налаштування профілю': 'Profile settings',
    'Довідка та підтримка': 'Help & support',
    'Увійти': 'Sign in',
    'Вийти': 'Sign out',
    'Зареєструватись': 'Sign up',
    'Реєстрація': 'Registration',
    'Завантаження...': 'Loading...',
    'Завантаження…': 'Loading…',
    'Будь ласка,': 'Please',
    'увійдіть': 'sign in',
    'Сервіс онлайн-голосувань та опитувань': 'Online survey and voting service',
    'Створюйте опитування, аналізуйте результати та діліться з іншими за лічені хвилини.': 'Create surveys, analyze results, and share them with others in minutes.',
    'Створюйте опитування': 'Create surveys',
    'Легко створюйте онлайн-опитування для будь-якої аудиторії.': 'Easily create online surveys for any audience.',
    'Аналізуйте результати': 'Analyze results',
    'Отримуйте наочну візуалізацію та статистику відповідей.': 'Get clear visualizations and response statistics.',
    'Ділитись просто': 'Easy sharing',
    'Поширюйте опитування через посилання чи соцмережі.': 'Share surveys using a direct link.',
    'Популярні опитування': 'Popular surveys',
    'Немає доступних опитувань.': 'No surveys are available.',
    'Долучитись до голосування': 'Open survey',
    'Доступні публічні опитування': 'Available public surveys',
    'Опитувань поки немає.': 'There are no surveys yet.',
    'Фільтрувати за назвою': 'Filter by title',
    'Фільтрувати за типом': 'Filter by type',
    'Фільтрувати за категорією': 'Filter by category',
    'Перейти до опитування': 'Open survey',
    'Одиночний вибір': 'Single choice',
    'Одиничний вибір': 'Single choice',
    'Множинний вибір': 'Multiple choice',
    'Текстові відповіді': 'Text responses',
    'Текстове питання': 'Text response',
    'Рейтингова шкала': 'Rating scale',
    'Рейтинг 1–5': 'Rating 1–5',
    'Невідомо': 'Unknown',
    'Невідомий варіант': 'Unknown option',
    'Назва опитування': 'Survey title',
    'Введіть назву опитування': 'Enter survey title',
    'Опис (необов’язково)': 'Description (optional)',
    'Додайте опис для опитування': 'Add a survey description',
    'Тип опитування': 'Survey type',
    'Варіанти відповідей': 'Answer options',
    '+ Додати варіант': '+ Add option',
    'Категорія': 'Category',
    'Виберіть категорію': 'Select a category',
    'Виберіть категорію.': 'Select a category.',
    'Завантаження категорій...': 'Loading categories...',
    'Публічне опитування': 'Public survey',
    'Скасувати': 'Cancel',
    'Публічні': 'Public',
    'Приватні': 'Private',
    'Усі': 'All',
    '+ Нове опитування': '+ New survey',
    'Редагувати опитування': 'Edit survey',
    'Назва': 'Title',
    'Опис': 'Description',
    'Тип': 'Type',
    'Активне': 'Active',
    'Активувати': 'Activate',
    'Деактивувати': 'Deactivate',
    'Редагувати': 'Edit',
    'Видалити': 'Delete',
    'Зберегти': 'Save',
    'Опитування оновлено!': 'Survey updated!',
    'Опитування видалено!': 'Survey deleted!',
    'Опитування активовано!': 'Survey activated!',
    'Опитування деактивовано!': 'Survey deactivated!',
    'Опитування не знайдено': 'Survey not found',
    'Назва опитування обов’язкова.': 'Survey title is required.',
    'Потрібно щонайменше 2 варіанти відповідей.': 'At least 2 answer options are required.',
    'Усі варіанти відповідей мають бути заповнені.': 'All answer options must be filled in.',
    'Опитування успішно створено!': 'Survey created successfully!',
    'Помилка створення опитування.': 'Unable to create the survey.',
    'Не вдалося завантажити категорії.': 'Unable to load categories.',
    'Не вдалося завантажити категорії': 'Unable to load categories',
    'Не вдалося завантажити опитування': 'Unable to load surveys',
    'Не вдалося завантажити опитування. Спробуйте пізніше.': 'Unable to load surveys. Please try again later.',
    'Оцініть (1–5):': 'Rate (1–5):',
    'Відправити': 'Submit',
    'Ваш коментар': 'Your comment',
    'Голосувати': 'Vote',
    'Дякуємо за вашу відповідь!': 'Thank you for your response!',
    'Результати': 'Results',
    'Результати ще не надані.': 'No results yet.',
    'Середній бал:': 'Average rating:',
    'Оцінки користувачів:': 'User ratings:',
    'Немає текстових відповідей.': 'There are no text responses.',
    'Текстові відповіді користувачів:': 'User text responses:',
    'Вибір користувачів:': 'User choices:',
    'Розподіл варіантів:': 'Option distribution:',
    'Опитування на модерації': 'Survey is pending moderation',
    'Опитування закрито адміністратором': 'Survey was closed by an administrator',
    'Опитування деактивовано користувачем': 'Survey was deactivated by its owner',
    'Причина:': 'Reason:',
    'У вас немає доступу до результатів цього опитування.': 'You do not have access to this survey’s results.',
    'Автор:': 'Author:',
    "Ім'я користувача": 'Username',
    "Ім'я": 'Name',
    'Введіть ім\'я користувача': 'Enter username',
    'Введіть ваше ім\'я': 'Enter your name',
    'Введіть email': 'Enter email',
    'Введіть ваш email': 'Enter your email',
    'Пароль': 'Password',
    'Введіть пароль': 'Enter password',
    'Підтвердження паролю': 'Confirm password',
    'Підтвердіть пароль': 'Confirm password',
    'Вже маєте акаунт? Увійти': 'Already have an account? Sign in',
    'Не маєте акаунту? Зареєструватись': 'Don’t have an account? Sign up',
    'Будь ласка, заповніть усі поля.': 'Please fill in all fields.',
    'Паролі не співпадають.': 'Passwords do not match.',
    'Пароль має містити щонайменше 6 символів.': 'Password must be at least 6 characters long.',
    'Некоректний email.': 'Invalid email.',
    'Помилка реєстрації. Спробуйте ще раз.': 'Registration failed. Please try again.',
    'Помилка входу. Спробуйте ще раз.': 'Sign-in failed. Please try again.',
    'Особисті дані': 'Personal information',
    'Новий пароль': 'New password',
    'Залиште порожнім, якщо не хочете змінювати': 'Leave blank if you do not want to change it',
    'Зберігається...': 'Saving...',
    'Зберегти налаштування': 'Save settings',
    'Видалити акаунт': 'Delete account',
    'Заявка на підвищення прав': 'Advanced access request',
    'Ваша заявка на розгляді': 'Your request is under review',
    'Ваша заявка схвалена': 'Your request was approved',
    'Створити нову заявку': 'Create a new request',
    'Коментар до заявки': 'Request comment',
    'Вкажіть причину підвищення прав': 'Explain why you need advanced access',
    'Подати заявку': 'Submit request',
    'Інформація про аккаунт': 'Account information',
    'Тип аккаунту:': 'Account type:',
    'Адміністратор': 'Administrator',
    'Продвинутий користувач': 'Advanced user',
    'Стандартний користувач': 'Standard user',
    'Дата реєстрації:': 'Registration date:',
    'Налаштування збережено!': 'Settings saved!',
    'Заявка на підвищення прав подана!': 'Advanced access request submitted!',
    'Акаунт успішно видалено!': 'Account deleted successfully!',
    'Управління користувачами': 'User management',
    'Пошук користувачів': 'Search users',
    'Всі ролі': 'All roles',
    'Звичайний': 'Standard',
    'Продвинутий': 'Advanced',
    'Адмін': 'Admin',
    'Редагувати користувача': 'Edit user',
    'Новий пароль (залиште порожнім, якщо не змінюєте)': 'New password (leave blank to keep the current one)',
    'Введіть новий пароль': 'Enter a new password',
    'Роль': 'Role',
    'Дата реєстрації': 'Registration date',
    'Дії': 'Actions',
    'Користувач видалений!': 'User deleted!',
    'Дані користувача оновлені!': 'User updated!',
    'Кількість таблиць': 'Tables',
    'Розмір бази даних': 'Database size',
    'Всього записів': 'Total records',
    'Остання резервна копія': 'Last backup',
    'Опитування': 'Surveys',
    'Голоси': 'Votes',
    'Категорії': 'Categories',
    'Варіанти опитувань': 'Survey options',
    'Рейтингові відповіді': 'Rating responses',
    'Модерація опитувань': 'Survey moderation',
    'Пошук...': 'Search...',
    'Таблиця опитувань (polls)': 'Surveys table (polls)',
    'Таблиця користувачів (users)': 'Users table (users)',
    'Таблиця голосувань (votes)': 'Votes table (votes)',
    'Таблиця категорій (categories)': 'Categories table (categories)',
    'Таблиця варіантів опитувань (poll_options)': 'Survey options table (poll_options)',
    'Таблиця рейтингових відповідей (rating_responses)': 'Rating responses table (rating_responses)',
    'Таблиця текстових відповідей (text_responses)': 'Text responses table (text_responses)',
    'Таблиця модерації опитувань (poll_moderation)': 'Survey moderation table (poll_moderation)',
    'Власник': 'Owner',
    'Статус': 'Status',
    'Створено': 'Created',
    'Порядок': 'Order',
    'Рейтинг': 'Rating',
    'Коментар': 'Comment',
    'Дія': 'Action',
    'Опитування ID': 'Survey ID',
    'Варіант ID': 'Option ID',
    'Користувач ID': 'User ID',
    'Адмін ID': 'Admin ID',
    'Текст варіанту': 'Option text',
    'Текст відповіді': 'Response text',
    'Дата голосування': 'Vote date',
    'Введіть SQL-запит (лише SELECT-запити)...': 'Enter a read-only SQL query...',
    'SQL-запит не може бути порожнім': 'SQL query cannot be empty',
    'Виконати запит': 'Run query',
    'Результат запиту': 'Query result',
    'Активні опитування': 'Active surveys',
    'Активні учасники': 'Active participants',
    'Відповіді сьогодні': 'Responses today',
    'Нові користувачі сьогодні': 'New users today',
    'Немає даних': 'No data',
    'Немає даних для відображення.': 'No data to display.',
    'Тижнева активність': 'Weekly activity',
    'Нові користувачі за тиждень': 'New users this week',
    'Нові опитування за тиждень': 'New surveys this week',
    'Останні опитування': 'Recent surveys',
    'Автор': 'Author',
    'Учасники': 'Participants',
    'Активно': 'Active',
    'Закрите': 'Closed',
    'Підготовка': 'Preparation',
    'Переглянути': 'View',
    'Закрити': 'Close',
    'Заявки на публікацію опитувань': 'Survey publication requests',
    'Деталі': 'Details',
    'Схвалити': 'Approve',
    'Відхилити': 'Reject',
    'Деталі опитування:': 'Survey details:',
    'Немає опису': 'No description',
    'Заявки на підвищення прав': 'Advanced access requests',
    'Користувач': 'User',
    'Текст заявки': 'Request text',
    'Відхилити опитування': 'Reject survey',
    'Відхилити заявку': 'Reject request',
    'Підтвердити': 'Confirm',
    'На розгляді': 'Pending',
    'Відхилене адміністратором': 'Rejected by administrator',
    'Часті запитання': 'Frequently asked questions',
    'Як створити нове опитування?': 'How do I create a new survey?',
    'Як змінити налаштування профілю?': 'How do I change my profile settings?',
    'Чим відрізняється продвинутий користувач від звичайного?': 'What is the difference between an advanced and a standard user?',
    'Як видалити аккаунт?': 'How do I delete my account?',
    'Сторінку не знайдено': 'Page not found',
    'На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.': 'The page you are looking for does not exist or has been moved.',
    'Повернутись на головну': 'Return home',

    'Переглянути публічні опитування': 'View public surveys',
    'Вхід до системи': 'Sign in',
    'Немає акаунта? Зареєструватись': 'Don’t have an account? Sign up',
    'Коротка довідка щодо основних можливостей сервісу.': 'A quick guide to the main features of the service.',
    'Створення, модерація, публікація та керування власними опитуваннями.': 'Create, moderate, publish, and manage your own surveys.',
    'Аналітика': 'Analytics',
    'Результати для одиночного і множинного вибору, текстових відповідей та рейтингової шкали.': 'Results for single choice, multiple choice, text responses, and rating scale surveys.',
    'Мова інтерфейсу': 'Interface language',
    'Перемикайте українську та англійську кнопкою EN / UA у правому нижньому куті.': 'Switch between Ukrainian and English with the EN / UA button in the lower-right corner.',
    'Як отримати право створювати опитування?': 'How do I get permission to create surveys?',
    'Хто може переглядати результати?': 'Who can view survey results?',
    'Як змінити мову інтерфейсу?': 'How do I change the interface language?',
    "Створювати опитування можуть користувачі з роллю 'advanced' та адміністратори. Відкрийте 'Мої опитування', натисніть '+ Нове опитування', заповніть форму та збережіть її. Нове опитування спочатку має статус підготовки і може бути схвалене адміністратором.": "Users with the 'advanced' role and administrators can create surveys. Open 'My surveys', click '+ New survey', complete the form, and save it. A new survey starts in preparation status and can be approved by an administrator.",
    "Стандартний користувач може відкрити 'Налаштування' і подати заявку на підвищення прав. Після схвалення адміністратором роль зміниться на 'advanced'.": "A standard user can open 'Settings' and submit an advanced access request. After administrator approval, the role changes to 'advanced'.",
    'Повні результати опитування доступні його автору та адміністратору. Учасник бачить власну відповідь після голосування.': 'Full survey results are available to the survey author and administrators. A participant can see their own response after voting.',
    'Натисніть кнопку EN / UA у правому нижньому куті. Обрана мова зберігається у браузері.': 'Click the EN / UA button in the lower-right corner. Your language choice is saved in the browser.',
    "Перейдіть на сторінку 'Налаштування'. Там можна змінити ім’я користувача, email і пароль.": "Open 'Settings' to change your username, email, or password.",
    "Перейдіть на сторінку 'Налаштування' та натисніть 'Видалити акаунт'. Дія незворотна, а пов’язані дані видаляються відповідно до зв’язків у базі даних.": "Open 'Settings' and click 'Delete account'. This action cannot be undone, and related data is deleted according to the database relationships.",
    'Освіта': 'Education',
    'Технології': 'Technology',
    'Розваги': 'Entertainment',
    'Суспільство': 'Society',
    'Інше': 'Other',
    'пн': 'Mon', 'вт': 'Tue', 'ср': 'Wed', 'чт': 'Thu', 'пт': 'Fri', 'сб': 'Sat', 'нд': 'Sun',
    "Шукати опитування...": "Search surveys...",
    "Помилка завантаження статистики бази даних": "Failed to load database statistics",
    "Помилка завантаження даних таблиць": "Failed to load table data",
    "Помилка виконання SQL-запиту": "SQL query failed",
    "Пошук за ID, назвою, власником, категорією, статусом": "Search by ID, title, owner, category, status",
    "Пошук за ID, ім'ям, email, роллю": "Search by ID, name, email, role",
    "Пошук за ID, ID опитування, ID варіанту, ID користувача": "Search by ID, survey ID, option ID, user ID",
    "Пошук за ID, назвою": "Search by ID or name",
    "Пошук за ID, ID опитування, текстом варіанту, порядком": "Search by ID, survey ID, option text, order",
    "Пошук за ID, ID опитування, ID користувача": "Search by ID, survey ID, user ID",
    "Пошук за ID, ID опитування, ID користувача, текстом відповіді": "Search by ID, survey ID, user ID, response text",
    "Пошук за ID, ID опитування, ID адміна, дією, коментарем": "Search by ID, survey ID, admin ID, action, comment",
    "Введіть пошуковий запит": "Enter a search query",
    "Зареєстровано": "Registered",
    "Помилка завантаження категорій": "Failed to load categories",
    "Помилка завантаження опитувань": "Failed to load surveys",
    "Помилка оновлення опитування": "Failed to update survey",
    "Помилка при оновленні опитування": "An error occurred while updating the survey",
    "Помилка зміни статусу": "Failed to change status",
    "Помилка при зміні статусу опитування": "An error occurred while changing survey status",
    "Ви впевнені, що хочете видалити це опитування?": "Are you sure you want to delete this survey?",
    "Помилка видалення опитування": "Failed to delete survey",
    "Помилка при видаленні опитування": "An error occurred while deleting the survey",
    "Деактивовано": "Deactivated",
    "Помилка завантаження профілю": "Failed to load profile",
    "Помилка:": "Error:",
    "Не вдалося отримати статус заявки": "Failed to retrieve request status",
    "Не вдалося оновити налаштування.": "Failed to update settings.",
    "Помилка збереження налаштувань.": "Failed to save settings.",
    "Помилка подання заявки": "Failed to submit request",
    "Ви точно хочете видалити свій акаунт? Цю дію не можна скасувати.": "Are you sure you want to delete your account? This action cannot be undone.",
    "Помилка видалення акаунту.": "Failed to delete account.",
    "Сталася помилка при видаленні акаунту.": "An error occurred while deleting the account.",
    "Не знайдено": "Not found",
    "Помилка завантаження користувачів": "Failed to load users",
    "Ви впевнені, що хочете видалити цього користувача?": "Are you sure you want to delete this user?",
    "Помилка видалення користувача": "Failed to delete user",
    "Помилка при видаленні користувача": "An error occurred while deleting the user",
    "Помилка оновлення користувача": "Failed to update user",
    "Помилка при оновленні користувача": "An error occurred while updating the user",
    "Помилка завантаження даних.": "Failed to load data.",
    "Помилка отримання заявок на підвищення прав користувачів": "Failed to load advanced access requests",
    "Ви впевнені, що хочете закрити це опитування?": "Are you sure you want to close this survey?",
    "Опитування успішно закрите!": "Survey closed successfully!",
    "Помилка закриття опитування.": "Failed to close survey.",
    "Опитування успішно видалено!": "Survey deleted successfully!",
    "Помилка видалення опитування.": "Failed to delete survey.",
    "Ви впевнені, що хочете схвалити це опитування?": "Are you sure you want to approve this survey?",
    "Опитування успішно схвалено!": "Survey approved successfully!",
    "Помилка схвалення опитування.": "Failed to approve survey.",
    "Ви впевнені, що хочете відхилити це опитування?": "Are you sure you want to reject this survey?",
    "Опитування успішно відхилено!": "Survey rejected successfully!",
    "Помилка відхилення опитування.": "Failed to reject survey.",
    "Ви впевнені, що хочете схвалити цю заявку?": "Are you sure you want to approve this request?",
    "Заявка успішно схвалена!": "Request approved successfully!",
    "Помилка схвалення заявки": "Failed to approve request",
    "Заявка успішно відхилена!": "Request rejected successfully!",
    "Помилка відхилення заявки": "Failed to reject request",
    "Введіть причину відхилення": "Enter the rejection reason",
    "Маршрут не знайдено": "Route not found",
    "Внутрішня помилка сервера": "Internal server error",
    "Помилка отримання користувачів": "Failed to retrieve users",
    "Помилка отримання опитувань": "Failed to retrieve surveys",
    "Помилка отримання голосів": "Failed to retrieve votes",
    "Помилка отримання категорій": "Failed to retrieve categories",
    "Помилка отримання варіантів опитувань": "Failed to retrieve survey options",
    "Помилка отримання рейтингових відповідей": "Failed to retrieve rating responses",
    "Помилка отримання текстових відповідей": "Failed to retrieve text responses",
    "Помилка отримання модерації опитувань": "Failed to retrieve survey moderation data",
    "Помилка отримання статистики": "Failed to retrieve statistics",
    "Опитування закрито": "Survey closed",
    "Опитування видалено": "Survey deleted",
    "Опитування схвалено": "Survey approved",
    "Необхідно вказати причину відхилення": "A rejection reason is required",
    "Опитування відхилено": "Survey rejected",
    "Токен відсутній": "Authentication token is missing",
    "Такого користувача не існує": "User does not exist",
    "Недійсний або прострочений токен": "Invalid or expired token",
    "Недостатньо прав": "Insufficient permissions",
    "Дозволено лише запити для читання (SELECT/SHOW/DESCRIBE/EXPLAIN)": "Only read-only queries are allowed (SELECT/SHOW/DESCRIBE/EXPLAIN)",
    "Запит до чутливих полів заборонено": "Queries to sensitive fields are not allowed",
    "Дозволено лише один SQL-запит за раз": "Only one SQL query is allowed at a time",
    "Користувача не знайдено": "User not found",
    "Ім’я користувача має містити від 3 до 50 символів": "Username must contain 3 to 50 characters",
    "Некоректний email": "Invalid email address",
    "Пароль має містити щонайменше 6 символів": "Password must contain at least 6 characters",
    "Email вже використовується іншим користувачем": "Email is already used by another user",
    "Логін вже використовується іншим користувачем": "Username is already used by another user",
    "Недійсна роль користувача": "Invalid user role",
    "Профіль оновлено успішно": "Profile updated successfully",
    "Помилка оновлення профілю": "Failed to update profile",
    "Помилка отримання профілю користувача": "Failed to retrieve user profile",
    "Некоректний ID користувача": "Invalid user ID",
    "Ви не можете видалити іншого користувача": "You cannot delete another user",
    "Користувача успішно видалено разом з усіма його даними.": "User and all associated data were deleted successfully.",
    "Ваш акаунт уже має розширені права": "Your account already has advanced access",
    "У вас вже є заявка на розгляді": "You already have a pending request",
    "Заявка успішно подана": "Request submitted successfully",
    "Помилка отримання статусу заявки": "Failed to retrieve request status",
    "Помилка отримання заявок": "Failed to retrieve requests",
    "Заявку не знайдено": "Request not found",
    "Заявку вже оброблено": "Request has already been processed",
    "Заявка відхилена": "Request rejected",
    "Заявка схвалена": "Request approved",
    "Недостатньо прав для створення опитування": "Insufficient permissions to create a survey",
    "Назва опитування обов’язкова і має містити до 255 символів": "Survey title is required and must be at most 255 characters",
    "Недійсний тип опитування": "Invalid survey type",
    "Потрібно щонайменше 2 різні варіанти відповідей": "At least 2 different answer options are required",
    "Помилка створення опитування": "Failed to create survey",
    "Тип існуючого опитування змінювати не можна": "The type of an existing survey cannot be changed",
    "Опитування наразі недоступне": "Survey is currently unavailable",
    "Невідомий тип опитування": "Unknown survey type",
    "Помилка отримання опитування": "Failed to retrieve survey",
    "У вас немає прав на перегляд результатів": "You do not have permission to view results",
    "Помилка отримання результатів": "Failed to retrieve results",
    "У вас немає прав на перегляд статусу опитування": "You do not have permission to view survey status",
    "Помилка отримання статусу опитування": "Failed to retrieve survey status",
    "Опитування видалено успішно": "Survey deleted successfully",
    "Недійсна дія модерації": "Invalid moderation action",
    "Помилка модерації опитування": "Survey moderation failed",
    "Опитування неактивне або закрите": "Survey is inactive or closed",
    "Ви вже відповіли на це опитування": "You have already responded to this survey",
    "Недійсний варіант відповіді": "Invalid answer option",
    "Необхідно вказати хоча б один варіант відповіді": "Select at least one answer option",
    "Один або кілька варіантів відповіді недійсні": "One or more answer options are invalid",
    "Необхідно вказати текстову відповідь": "A text response is required",
    "Недійсний рейтинг": "Invalid rating",
    "Голос успішно зареєстровано": "Response submitted successfully",
    "Помилка голосування": "Failed to submit response",
    "Опитування вже закрите": "Survey is already closed",
    "Опитування успішно закрите": "Survey closed successfully",
    "Користувач із таким ім’ям уже існує": "A user with this username already exists",
    "Користувач із таким email уже існує": "A user with this email already exists",
    "Помилка реєстрації": "Registration failed",
    "Введіть ім’я користувача та пароль": "Enter a username and password",
    "Недійсні облікові дані": "Invalid credentials",
    "Помилка входу": "Sign-in failed",
};

const EN_TO_UK = Object.fromEntries(Object.entries(UK_TO_EN).map(([uk, en]) => [en, uk]));

const dynamicToEnglish = [
    [/^Вітаємо, (.+)!$/, 'Welcome, $1!'],
    [/^Учасників:\s*(.+)$/, 'Participants: $1'],
    [/^Тип:\s*(.+)$/, 'Type: $1'],
    [/^Категорія:\s*(.+)$/, 'Category: $1'],
    [/^Автор:\s*(.+)$/, 'Author: $1'],
    [/^Причина:\s*(.+)$/, 'Reason: $1'],
    [/^Ваша оцінка:\s*(.+)$/, 'Your rating: $1'],
    [/^Ваш коментар:\s*(.+)$/, 'Your comment: $1'],
    [/^Варіант (\d+)$/, 'Option $1'],
    [/^Знайдено користувачів:\s*(\d+)$/, 'Users found: $1'],
    [/^Популярне опитування:\s*(.+)$/, 'Popular survey: $1'],
    [/^Ваша заявка\s*відхилена:\s*(.+)$/, 'Your request was rejected: $1'],
];

const dynamicToUkrainian = [
    [/^Welcome, (.+)!$/, 'Вітаємо, $1!'],
    [/^Participants:\s*(.+)$/, 'Учасників: $1'],
    [/^Type:\s*(.+)$/, 'Тип: $1'],
    [/^Category:\s*(.+)$/, 'Категорія: $1'],
    [/^Author:\s*(.+)$/, 'Автор: $1'],
    [/^Reason:\s*(.+)$/, 'Причина: $1'],
    [/^Your rating:\s*(.+)$/, 'Ваша оцінка: $1'],
    [/^Your comment:\s*(.+)$/, 'Ваш коментар: $1'],
    [/^Option (\d+)$/, 'Варіант $1'],
    [/^Users found:\s*(\d+)$/, 'Знайдено користувачів: $1'],
    [/^Popular survey:\s*(.+)$/, 'Популярне опитування: $1'],
    [/^Your request was rejected:\s*(.+)$/, 'Ваша заявка відхилена: $1'],
];

const preserveWhitespace = (original, translated) => {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
};

export const translateText = (value, language = localStorage.getItem('language') || 'uk') => {
    if (typeof value !== 'string' || !value.trim()) return value;
    const trimmed = value.trim();
    const exact = language === 'en' ? UK_TO_EN[trimmed] : EN_TO_UK[trimmed];
    if (exact) return preserveWhitespace(value, exact);

    const patterns = language === 'en' ? dynamicToEnglish : dynamicToUkrainian;
    for (const [pattern, replacement] of patterns) {
        if (pattern.test(trimmed)) return preserveWhitespace(value, trimmed.replace(pattern, replacement));
    }
    return value;
};

const translateAttributes = (element, language) => {
    for (const attr of ['placeholder', 'title', 'aria-label']) {
        if (element.hasAttribute?.(attr)) {
            const current = element.getAttribute(attr);
            const next = translateText(current, language);

            if (next !== current) {
                element.setAttribute(attr, next);
            }
        }
    }
};

const translateElement = (root, language) => {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

    if (root.closest?.('[data-no-translate="true"]')) return;

    // Перекладаємо атрибути самого елемента
    translateAttributes(root, language);

    // Перекладаємо placeholder/title/aria-label
    // у всіх вкладених елементах
    root.querySelectorAll?.(
        '[placeholder], [title], [aria-label]'
    ).forEach((element) => {
        if (element.closest('[data-no-translate="true"]')) return;

        translateAttributes(element, language);
    });

    // Перекладаємо звичайний текст
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
    );

    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        if (
            node.parentElement?.closest(
                '[data-no-translate="true"]'
            )
        ) {
            continue;
        }

        const next = translateText(
            node.nodeValue,
            language
        );

        if (next !== node.nodeValue) {
            node.nodeValue = next;
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'uk');

    const changeLanguage = useCallback((next) => {
        const normalized = next === 'en' ? 'en' : 'uk';
        localStorage.setItem('language', normalized);
        setLanguage(normalized);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language === 'en' ? 'en' : 'uk';
        translateElement(document.body, language);

        const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
            const element = mutation.target;

            if (!element.closest?.('[data-no-translate="true"]')) {
                translateAttributes(element, language);
            }

            continue;
        }

        if (mutation.type === 'characterData') {
            const node = mutation.target;

            if (
                !node.parentElement?.closest(
                    '[data-no-translate="true"]'
                )
            ) {
                const next = translateText(
                    node.nodeValue,
                    language
                );

                if (next !== node.nodeValue) {
                    node.nodeValue = next;
                }
            }

            continue;
        }

        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                if (
                    !node.parentElement?.closest(
                        '[data-no-translate="true"]'
                    )
                ) {
                    const next = translateText(
                        node.nodeValue,
                        language
                    );

                    if (next !== node.nodeValue) {
                        node.nodeValue = next;
                    }
                }
            } else if (
                node.nodeType === Node.ELEMENT_NODE
            ) {
                translateElement(node, language);
            }
        });
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
        'placeholder',
        'title',
        'aria-label'
    ]
});

        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        window.alert = (message) => originalAlert(translateText(String(message), language));
        window.confirm = (message) => originalConfirm(translateText(String(message), language));

        return () => {
            observer.disconnect();
            window.alert = originalAlert;
            window.confirm = originalConfirm;
        };
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage: changeLanguage, translate: (text) => translateText(text, language) }), [language, changeLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
            <button
                type="button"
                data-no-translate="true"
                className="btn btn-sm btn-outline-primary position-fixed"
                style={{ right: 16, bottom: 16, zIndex: 2000, minWidth: 72 }}
                onClick={() => changeLanguage(language === 'uk' ? 'en' : 'uk')}
                aria-label="Change language"
                title="Change language"
            >
                {language === 'uk' ? 'EN' : 'UA'}
            </button>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
