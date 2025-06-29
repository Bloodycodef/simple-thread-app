# 🧵 Simple Thread App (React Native + Supabase)

Aplikasi mobile thread sederhana seperti forum mini, dibuat dengan **React Native (Expo)** dan **Supabase** untuk backend & database. Aplikasi ini memungkinkan pengguna membuat, melihat, dan menghapus thread.

---

## 🚀 Fitur

- 🔐 Login dan register dengan email & password
- 📝 Membuat thread
- 📄 Menampilkan semua thread
- 💾 Terhubung langsung ke Supabase (auth & database)

---

## 🛠 Teknologi

- [React Native (Expo)](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Expo Router](https://expo.github.io/router/) _(opsional)_

---

## 📦 Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/Bloodycodef/simple-thread-app.git
cd simple-thread-app
```

2. **Install Dependencies**
```bash
npm install
# atau
yarn install
```

3. **Buat file Supabase client**
Buat file `lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://YOUR-PROJECT.supabase.co',
  'YOUR-ANON-KEY'
);
```

Ganti `YOUR-PROJECT` dan `YOUR-ANON-KEY` dengan info dari dashboard Supabase-mu.

---

## 🗃️ Setup Supabase Database

1. Buka [https://supabase.com/](https://supabase.com/) dan buat project baru.
2. Jalankan SQL berikut pada SQL Editor Supabase:

```sql
-- Table: threads
create table threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp default now()
);

-- Enable RLS
alter table threads enable row level security;

-- Policies
create policy "Allow logged-in users to read threads"
  on threads for select using (true);

create policy "Allow users to insert their own threads"
  on threads for insert with check (auth.uid() = user_id);

create policy "Allow users to delete their own threads"
  on threads for delete using (auth.uid() = user_id);
```

---

## ▶️ Menjalankan Aplikasi

```bash
npx expo start
```

Scan QR code menggunakan Expo Go di Android/iOS atau jalankan di emulator.


---

## 📌 To Do (Next Features)

- 💬 Komentar pada thread
- 👍 Like/Upvote sistem
- 📌 Pin thread
- 🔍 Pencarian thread

---

## 🧑‍💻 Kontribusi

Pull request terbuka untuk siapa saja. Jika kamu punya ide fitur baru atau menemukan bug, silakan buat PR atau buka [Issue](https://github.com/Bloodycodef/simple-thread-app/issues).


