# Настройка аутентификации в Supabase Dashboard

Этот документ описывает процесс настройки аутентификации в Supabase Dashboard для приложения FitBrutal.

## Шаг 1: Вход в Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.io/)
2. Войдите в свою учетную запись
3. Выберите проект FitBrutal

## Шаг 2: Настройка Email + Password аутентификации

1. В боковом меню выберите **Authentication** > **Providers**
2. В разделе **Email** убедитесь, что опция **Enable Email Sign In** включена
3. Настройте дополнительные параметры:
   - **Confirm email**: выберите, требуется ли подтверждение email
   - **Secure email change**: активируйте для безопасного изменения email
   - **Double confirm password changes**: включите для двойного подтверждения изменения пароля
4. Нажмите **Save** для сохранения настроек

## Шаг 3: (Опционально) Настройка OAuth провайдеров

### Google

1. В разделе **Authentication** > **Providers** найдите **Google**
2. Переведите тумблер в положение **Enabled**
3. Откройте [Google Cloud Console](https://console.cloud.google.com/)
4. Создайте новый проект или выберите существующий
5. Перейдите в **APIs & Services** > **Credentials**
6. Нажмите **Create Credentials** > **OAuth client ID**
7. Выберите тип приложения **Web application**
8. Добавьте **Authorized redirect URIs**:
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
9. Скопируйте полученные **Client ID** и **Client Secret**
10. Вставьте их в соответствующие поля в Supabase Dashboard
11. Нажмите **Save**

### Apple

1. В разделе **Authentication** > **Providers** найдите **Apple**
2. Переведите тумблер в положение **Enabled**
3. Зарегистрируйтесь в [Apple Developer Program](https://developer.apple.com/)
4. Перейдите в [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
5. Создайте новый **App ID** с включенным Sign In with Apple
6. Создайте **Services ID** для веб-аутентификации
7. Настройте **Domains and Subdomains** и **Return URLs**:
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
8. Создайте **Key** с активированным Sign In with Apple
9. Вставьте **Team ID**, **Key ID**, **Services ID** и **Private Key** в соответствующие поля в Supabase Dashboard
10. Нажмите **Save**

## Шаг 4: Настройка Email Templates

1. В боковом меню выберите **Authentication** > **Email Templates**
2. Настройте шаблоны для:
   - Подтверждение регистрации
   - Сброс пароля
   - Изменение email
   - Магические ссылки (если используются)
3. Для каждого шаблона вы можете изменить:
   - Тему письма
   - Текст письма
   - Дизайн (HTML/CSS)
4. Не забудьте заменить все упоминания о Supabase на FitBrutal
5. Нажмите **Save Changes** для каждого шаблона

## Шаг 5: Настройка дополнительных параметров

1. В боковом меню выберите **Authentication** > **Settings**
2. Настройте **Site URL** - URL вашего приложения (для перенаправления)
3. Настройте **Redirect URLs** - список разрешенных URL для перенаправления
4. Установите **JWT Expiry** (время действия токена) - рекомендуется 3600 (1 час)
5. Настройте **User Signups** - включить/отключить самостоятельную регистрацию
6. Нажмите **Save** для сохранения настроек

## Шаг 6: Проверка настроек

1. Перейдите в **Authentication** > **Users**
2. Проверьте, что вы можете создавать тестовых пользователей
3. Протестируйте процесс входа через Email + Password
4. Если настроены, протестируйте вход через Google и Apple

## Готово!

Теперь аутентификация в вашем проекте Supabase настроена и готова к использованию. Следующие шаги:
1. Интеграция аутентификации в приложении FitBrutal
2. Создание экранов входа и регистрации
3. Настройка перенаправлений и обработки ошибок 