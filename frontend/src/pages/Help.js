import React, { useState } from 'react';

const Help = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);

    const faqs = [
        {
            id: 1,
            question: 'Як створити нове опитування?',
            answer: "Створювати опитування можуть користувачі з роллю 'advanced' та адміністратори. Відкрийте 'Мої опитування', натисніть '+ Нове опитування', заповніть форму та збережіть її. Нове опитування спочатку має статус підготовки і може бути схвалене адміністратором."
        },
        {
            id: 2,
            question: 'Як отримати право створювати опитування?',
            answer: "Стандартний користувач може відкрити 'Налаштування' і подати заявку на підвищення прав. Після схвалення адміністратором роль зміниться на 'advanced'."
        },
        {
            id: 3,
            question: 'Хто може переглядати результати?',
            answer: 'Повні результати опитування доступні його автору та адміністратору. Учасник бачить власну відповідь після голосування.'
        },
        {
            id: 4,
            question: 'Як змінити мову інтерфейсу?',
            answer: 'Натисніть кнопку EN / UA у правому нижньому куті. Обрана мова зберігається у браузері.'
        },
        {
            id: 5,
            question: 'Як змінити налаштування профілю?',
            answer: "Перейдіть на сторінку 'Налаштування'. Там можна змінити ім’я користувача, email і пароль."
        },
        {
            id: 6,
            question: 'Як видалити аккаунт?',
            answer: "Перейдіть на сторінку 'Налаштування' та натисніть 'Видалити акаунт'. Дія незворотна, а пов’язані дані видаляються відповідно до зв’язків у базі даних."
        }
    ];

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h2>Довідка та підтримка</h2>
                <p className="text-muted mb-0">Коротка довідка щодо основних можливостей сервісу.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title">Опитування</h5>
                            <p className="card-text">Створення, модерація, публікація та керування власними опитуваннями.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title">Аналітика</h5>
                            <p className="card-text">Результати для одиночного і множинного вибору, текстових відповідей та рейтингової шкали.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title">Мова інтерфейсу</h5>
                            <p className="card-text">Перемикайте українську та англійську кнопкою EN / UA у правому нижньому куті.</p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="h4 mb-4">Часті запитання</h3>
            <div className="accordion" id="faqAccordion">
                {faqs.map((faq) => (
                    <div key={faq.id} className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${activeQuestion === faq.id ? '' : 'collapsed'}`}
                                type="button"
                                onClick={() => setActiveQuestion(activeQuestion === faq.id ? null : faq.id)}
                                aria-expanded={activeQuestion === faq.id}
                            >
                                {faq.question}
                            </button>
                        </h2>
                        <div className={`accordion-collapse collapse ${activeQuestion === faq.id ? 'show' : ''}`}>
                            <div className="accordion-body">{faq.answer}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Help;
