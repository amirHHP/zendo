# 🚀 راهنمای راه‌اندازی و دیپلوی Zendo روی Vercel

این سند مراحل اتصال دیتابیس رایگان PostgreSQL، تنظیمات Vercel، اتصال به ساب‌پث `theminiceo.ir/zendo`، فعال‌سازی درگاه زرین‌پال و راه‌اندازی PWA را شرح می‌دهد.

---

## ۱. دیتابیس رایگان PostgreSQL (Neon)

برای بیشترین فضای رایگان بدون نیاز به ورود به پنل، از **Neon** استفاده می‌کنیم (۰.۵ گیگابایت فضای رایگان ابری و کاملاً هماهنگ با Vercel):

### روش راه‌اندازی مستقیم از ترمینال:
1. در سایت [neon.tech](https://neon.tech) ثبت‌نام کنید یا از ابزار CLI آن استفاده کنید.
2. آدرس اتصال (`DATABASE_URL`) دریافتی را در فایل `.env` یا متغیرهای محیطی Vercel قرار دهید:
   ```bash
   DATABASE_URL="postgresql://[user]:[password]@[host]/zendo?sslmode=require"
   ```
3. برای ساخت و همگام‌سازی خودکار تمام جدول‌ها، فقط این کامند را در ترمینال اجرا کنید (بدون نیاز به نوشتن هیچ کد SQL یا کار در پنل):
   ```bash
   npx prisma db push
   ```

---

## ۲. دیپلوی روی Vercel

### روش سریع با Vercel CLI:
```bash
# نصب Vercel CLI (در صورت عدم نصب قبلی)
npm i -g vercel

# دیپلوی
vercel
```

### متغیرهای محیطی در Vercel (Environment Variables):
در تنظیمات پروژه در Vercel، مقادیر زیر را در بخش **Settings > Environment Variables** وارد کنید:

| نام متغیر | مقدار نمونه / توضیح |
|---|---|
| `DATABASE_URL` | آدرس PostgreSQL از Neon یا Supabase |
| `NEXTAUTH_URL` | `https://zendo.theminiceo.ir` |
| `NEXTAUTH_SECRET` | یک رشته امن و تصادفی ۳۲ کاراکتری |
| `GEMINI_API_KEY` | کلید پیش‌فرض سرور (از Google AI Studio) |
| `ZARINPAL_MERCHANT_ID` | مرچنت‌کد زرین‌پال شما |
| `ZARINPAL_SANDBOX` | `false` (در محیط تولید) یا `true` (برای حالت تستی) |
| `PRO_MONTHLY_PRICE` | `49000` (مبلغ به تومان) |
| `PRO_YEARLY_PRICE` | `390000` (مبلغ به تومان) |

---

## ۳. تنظیم دامنه `theminiceo.ir/zendo`

با تنظیم متغیر:
```env
NEXT_PUBLIC_BASE_PATH="/zendo"
```
اپلیکیشن به صورت خودکار تمام صفحات، فایل‌های استاتیک، APIها و PWA Manifest را روی مسیر `/zendo` سرو می‌کند.

اگر از **Nginx** روی سرور `theminiceo.ir` استفاده می‌کنید، کافیست کانفیگ زیر را اضافه کنید:
```nginx
location /zendo {
    proxy_pass https://your-zendo-app.vercel.app/zendo;
    proxy_set_header Host your-zendo-app.vercel.app;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

یا اگر دامنه را مستقیماً به Vercel متصل کرده‌اید، می‌توانید مسیر را با Vercel Rewrites یا Custom Domains مدیریت کنید.

---

## ۴. نصب PWA روی موبایل (iOS و Android)

- **آیفون (iOS Safari):**
  1. وارد `https://theminiceo.ir/zendo` شوید.
  2. دکمه **Share** (آیکون اشتراک‌گذاری در پایین سافاری) را بزنید.
  3. گزینه **Add to Home Screen** را لمس کنید.
- **اندروید (Chrome):**
  1. پیامی به صورت خودکار با عنوان **Install Zendo** در پایین صفحه ظاهر می‌شود.
  2. در غیر این صورت، از منوی سه نقطه دکمه **Install app** را انتخاب کنید.

---

## ۵. تست و اجرای محلی (Local Development)

```bash
# اجرای نسخه توسعه
npm run dev

# ساخت و تست نسخه پروداکشن
npm run build
npm run start
```
