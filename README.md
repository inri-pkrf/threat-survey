# טוטם האיומים

אפליקציית הצבעה למסכי טוטם. React + Vite, מסד נתונים ב-Supabase, פריסה ב-Vercel.
האפליקציה אינה תלויה יותר ב-base44.

## הגדרה ראשונית

1. **Supabase**: צרי פרויקט, ב-SQL Editor הדביקי והריצי את `supabase/schema.sql`.
   אפשר להריץ אותו שוב בכל עדכון, הוא לא מוחק נתונים.
2. מ-Project Settings -> API העתיקי את `Project URL` ואת ה-Publishable key.
3. **Vercel** -> Settings -> Environment Variables: `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY`.

## שעות ההצבעה

ברירת המחדל: 07:30 עד 16:30 לפי שעון ישראל. מחוץ לשעות המסך מציג "הסקר סגור"
והשרת מתעלם מהצבעות. כדי לשנות, ב-SQL Editor:

```sql
update public.voting_window set open_time = '08:00', close_time = '17:00' where id = 1;
```

## דוח יומי במייל

בסוף כל יום נשלח מייל עם: התאריך, סך המצביעים, תוצאות ואחוזים לפי קטגוריה,
הצבעות לפי שעה, וקובץ CSV מצורף (קטגוריה x שעה). הנתונים נשמרים בטבלה `vote_log`
(שורה לכל הצבעה) ולא נמחקים באיפוס המנהלת.

הגדרה (פעם אחת), ב-Vercel -> Settings -> Environment Variables:

| משתנה | ערך |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | מפתח ה-**Secret** מ-Supabase (API Keys). סוד! רק ב-Vercel, לעולם לא עם `VITE_` |
| `RESEND_API_KEY` | מפתח מ-resend.com (חשבון חינמי) |
| `REPORT_TO_EMAIL` | כתובת המייל שמקבלת את הדוח |
| `CRON_SECRET` | סיסמה אקראית ארוכה |

אחרי ההגדרה עשי Redeploy. השליחה האוטומטית מוגדרת ב-`vercel.json` (Vercel Cron).
בתוכנית החינמית של Vercel השעה אינה מדויקת: המייל מגיע בערב, כשעה עד שעתיים אחרי הסגירה.

**בדיקה ידנית של המייל** (שולח את דוח היום מיד):
`https://הכתובת-שלך.vercel.app/api/daily-report?force=1&secret=<CRON_SECRET>`

**חשוב ב-Resend:** בלי אימות דומיין אפשר לשלוח רק לכתובת המייל שבה נרשמת ל-Resend.
לכן הירשמי ל-Resend עם אותה כתובת שאמורה לקבל את הדוח.

## שינויים בלי base44

עורכים את הקוד ב-GitHub (או במחשב) ו-Vercel מתעדכן לבד. אל תערכי יותר דרך העורך של base44:
הסנכרון שלו עם GitHub יכול לדרוס שינויים.
