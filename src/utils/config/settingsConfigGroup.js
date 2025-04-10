export const settingsConfigGroup = {
  basic: {
    label: 'Основные настройки',
    icon: 'settings',
    fields: {
      show_marking: {
        type: 'checkbox',
        label: 'Отображать поле "Маркировка"',
        default: true,
      },
      language: {
        type: 'select',
        label: 'Язык приложения',
        default: 'ru',
        options: [
          { value: 'ru', label: 'Русский' },
          { value: 'en', label: 'Английский' },
        ],
      }
    },
  },

  receipts: {
    label: 'Настройки чеков',
    icon: 'receipt',
    fields: {
      notify_close: {
        type: 'checkbox',
        label: 'Уведомление о закрытии чека',
        default: true,
      },
      currency_rounding: {
        type: 'checkbox',
        label: 'Округление суммы чека в валюте',
        default: false,
      },
      restore_receipt: {
        type: 'checkbox',
        label: 'Восстанавливать чек',
        default: false,
      },
      print_copy: {
        type: 'checkbox',
        label: 'Печать копии чека',
        default: true,
      },
    },
  },

  currency: {
    label: 'Валютные операции',
    icon: 'currency_exchange',
    fields: {
      currency_incasso: {
        type: 'checkbox',
        label: 'Валютная инкассация',
        default: false,
      },
      exchange_mode: {
        type: 'select',
        label: 'Режим курсов валют',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Автоматический' },
          { value: 'manual', label: 'Ручной' },
        ],
      },
    },
  },

  security: {
    label: 'Безопасность',
    icon: 'security',
    fields: {
      empty_passwords: {
        type: 'checkbox',
        label: 'Запрещать пустые пароли',
        default: true,
      },
      fr_required: {
        type: 'checkbox',
        label: 'Запрещать работу без ФР',
        default: true,
      },
      cashier_auth: {
        type: 'checkbox',
        label: 'Авторизация кассира',
        default: false,
      },
    },
  },

  interface: {
    label: 'Интерфейс',
    icon: 'computer',
    fields: {
      auto_activate: {
        type: 'checkbox',
        label: 'Автоактивация окна кассы',
        default: true,
      },
      show_quantity: {
        type: 'checkbox',
        label: 'Запрашивать количество',
        default: false,
      },
      sound_notify: {
        type: 'checkbox',
        label: 'Звуковые уведомления',
        default: true,
      },
    },
  },

  advanced: {
    label: 'Дополнительные настройки',
    icon: 'tune',
    fields: {
      log_azimuth: {
        type: 'checkbox',
        label: 'Вести лог Azimuth',
        default: false,
      },
      max_hours_diff: {
        type: 'number',
        label: 'Макс. разность часов ФР',
        default: 5,
        min: 0,
        max: 24,
      },
      receipt_xml: {
        type: 'xml',
        label: 'XML шаблон чека',
        default: '<receipt>Привет</receipt>',
      },
    },
  },
}
