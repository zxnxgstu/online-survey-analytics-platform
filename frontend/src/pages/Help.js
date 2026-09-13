import React, { useState } from "react";

// Компонент довідки
const Help = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "Як створити нове опитування?",
            answer: "Для створення нового опитування перейдіть на сторінку 'Мої опитування' та натисніть кнопку '+ Нове опитування'. Заповніть необхідні поля, додайте варіанти відповідей та натисніть 'Створити опитування'."
        },
        {
            id: 2,
            question: "Як поділитись опитуванням?",
            answer: "На сторінці деталей опитування натисніть кнопку 'Поділитися'. Ви можете скопіювати посилання на опитування або поділитись через соціальні мережі."
        },
        {
            id: 3,
            question: "Як змінити налаштування профілю?",
            answer: "Перейдіть на сторінку 'Налаштування' через бічне меню. Там ви можете змінити особисті дані, налаштувати сповіщення та змінити мову інтерфейсу."
        },
        {
            id: 4,
            question: "Як експортувати результати опитування?",
            answer: "На сторінці деталей опитування натисніть кнопку 'Експорт результатів'. Ви можете завантажити дані у форматах CSV, Excel або PDF."
        },
        {
            id: 5,
            question: "Чим відрізняється продвинутий користувач від звичайного?",
            answer: "Продвинутий аккаунт надає доступ до аналітики, можливості створення опитувань"
        },
        {
            id: 6,
            question: "Як видалити аккаунт?",
            answer: "Перейдіть на сторінку 'Налаштування' та натисніть кнопку 'Видалити аккаунт' внизу сторінки. Зверніть увагу, що ця дія є незворотною, і всі ваші дані будуть видалені."
        }
    ];

    const toggleQuestion = (id) => {
        if (activeQuestion === id) {
            setActiveQuestion(null);
        } else {
            setActiveQuestion(id);
        }
    };

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <h2 className="text-center mb-5">Довідка та підтримка</h2>
                </div>
            </div>

            <div className="row mb-5">
                <div className="col-md-4 mb-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Документація </h5>
                            <p className="card-text">Детальні інструкції з використання всіх функцій сервісу.</p>
                            <a href="#" className="btn btn-primary">Переглянути документацію</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Відео-уроки</h5>
                            <p className="card-text">Навчальні відео, які допоможуть вам освоїти сервіс.</p>
                            <a href="#" className="btn btn-success">Дивитись відео-уроки</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Підтримка</h5>
                            <p className="card-text">Виникли проблеми? Зв'яжіться з нашою службою підтримки.</p>
                            <a href="#" className="btn btn-danger">Звернутись до підтримки</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <h3 className="h4 mb-4">Часті запитання</h3>

                <div className="accordion" id="faqAccordion">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="accordion-item">
                            <h2 className="accordion-header" id={`heading${faq.id}`}>
                                <button
                                    className="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${faq.id}`}
                                    aria-expanded={activeQuestion === faq.id ? "true" : "false"}
                                    aria-controls={`collapse${faq.id}`}
                                    onClick={() => toggleQuestion(faq.id)}
                                >
                                    {faq.question}
                                </button>
                            </h2>
                            <div
                                id={`collapse${faq.id}`}
                                className={`accordion-collapse collapse ${activeQuestion === faq.id ? "show" : ""}`}
                                aria-labelledby={`heading${faq.id}`}
                                data-bs-parent="#faqAccordion"
                            >
                                <div className="accordion-body">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card bg-light p-4">
                        <h5>Зв'язатись з нами</h5>
                        <form>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Ваше ім'я</label>
                                <input type="text" className="form-control" id="name" placeholder="Введіть ваше ім'я" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" className="form-control" id="email" placeholder="Введіть ваш email" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="message" className="form-label">Повідомлення</label>
                                <textarea className="form-control" id="message" rows="4" placeholder="Введіть ваше повідомлення"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Надіслати</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card bg-light p-4">
                        <h5>Контактна інформація</h5>
                        <p><strong>Email:</strong> support@OnlineVoting.com</p>
                        <p><strong>Телефон:</strong> +380 44 123 45 67</p>
                        <p><strong>Адреса:</strong> м. Київ, вул. Хрещатик, 1</p>
                        <div>
                            <strong>Ми в соціальних мережах:</strong>
                            <div>
                                <a href="#" className="text-primary me-3">Facebook</a>
                                <a href="#" className="text-info me-3">Twitter</a>
                                <a href="#" className="text-danger">Instagram</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
