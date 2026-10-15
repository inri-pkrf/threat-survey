# טוטם האיומים

אפליקציית הצבעה למסכי טוטם. React + Vite, מסד נתונים ב-Supabase, פריסה ב-Vercel.
האפליקציה אינה תלויה יותר ב-base44.

## הגדרה ראשונית

1. **Supabase**: צרי פרויקט, ב-SQL Editor הדביקי והריצי את `supabase/schema.sql`.
2. מ-Project Settings -> API העתיקי את `Project URL` ואת `anon public key`.
3. **מקומית**: העתיקי `.env.example` ל-`.env` ומלאי את שני הערכים, ואז:
   ```bash
   npm install
   npm run dev
   ```
4. **Vercel**: Settings -> Environment Variables, הוסיפי `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY`, ואז Redeploy.
5. **תמונות**: הריצי פעם אחת `node scripts/download-images.mjs` ועשי commit לתיקיית `public/images`.

## שינוי קוד המנהלת

ב-Supabase -> SQL Editor:

```sql
update public.admin_settings set admin_code = '1234' where id = 1;
```
