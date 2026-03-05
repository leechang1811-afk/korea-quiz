# 한국 상위 몇%? 앱 배포 가이드

GitHub + Vercel(프론트) + Railway(백엔드) + Supabase(DB) 연동

---

## 1. 사전 준비

- [x] Supabase 프로젝트 생성 (korea_quiz)
- [x] DATABASE_URL 확보 (Settings → Database → Connection string URI)
- [ ] GitHub 계정
- [ ] Vercel 계정 (GitHub 로그인)
- [ ] Railway 계정 (GitHub 로그인)

---

## 2. GitHub 레포지토리 만들기

```bash
# 프로젝트 폴트에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/korean-quiz.git
git push -u origin main
```

**중요**: `.env` 파일은 **절대 커밋하지 마세요**. `.gitignore`에 있는지 확인:
```bash
grep -r "\.env" .gitignore
```

---

## 3. Railway에 백엔드 배포 (Supabase DB 연동)

1. [railway.app](https://railway.app) 접속 → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo**
3. `korean-quiz` 레포 선택
4. **Settings**에서 설정:
   - **Root Directory**: `.` (프로젝트 루트)
   - **Build Command**: `pnpm run build:server`
   - **Start Command**: `cd apps/server && node dist/index.js`
   - **Install Command**: `pnpm install` (기본값)

5. **Variables**에 환경변수 추가:
   ```
   DATABASE_URL=postgresql://postgres.xxx:비밀번호@...supabase.com:5432/postgres
   NODE_ENV=production
   PORT=3001
   ```

6. **Generate Domain**으로 공개 URL 발급 (예: `https://korean-quiz-api.up.railway.app`)
7. 이 URL을 **복사**해 두세요 (프론트엔드에서 사용)

---

## 4. Vercel에 프론트엔드 배포

1. [vercel.com](https://vercel.com) 접속 → **Login with GitHub**
2. **Add New** → **Project** → `korean-quiz` 레포 Import
3. **Configure Project**:
   - **Framework Preset**: Other (또는 Vite가 인식되면 Vite)
   - **Root Directory**: `.` (루트, vercel.json 사용)
   - **Build Command**: `pnpm run build:client` (vercel.json에 있음)
   - **Output Directory**: `apps/client/dist`

4. **Environment Variables** 추가:
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://당신의-railway-url.up.railway.app` |

5. **Deploy** 클릭

---

## 5. Supabase DB 마이그레이션

로컬에서 한 번만 실행 (DATABASE_URL이 .env에 설정된 상태):

```bash
cd apps/server
# .env에 DATABASE_URL이 있어야 함
npm run db:migrate
```

Railway 배포 시 마이그레이션을 자동 실행하려면 `package.json`의 `start`를 수정:
```json
"start": "node -e \"require('dotenv').config(); const { execSync } = require('child_process'); try { execSync('npx drizzle-kit migrate', { stdio: 'inherit' }); } catch(e) {} \" && node dist/index.js"
```
또는 Railway의 **Deploy** 훅에서 별도 마이그레이션 스크립트 실행.

**권장**: 로컬에서 `npm run db:migrate` 한 번 실행 후 배포.

---

## 6. 배포 후 확인

| 항목 | URL |
|------|-----|
| 프론트엔드 | `https://korean-quiz.vercel.app` (Vercel이 발급한 주소) |
| 백엔드 API | `https://xxx.up.railway.app/api/health` |
| DB 연결 | `https://xxx.up.railway.app/api/health/db` |

---

## 7. 트러블슈팅

| 증상 | 해결 |
|------|------|
| "결과 불러오기 실패" | VITE_API_URL이 올바른지, Railway가 실행 중인지 확인 |
| CORS 에러 | Railway 서버의 cors 설정 확인 (현재 `origin: true`로 모든 origin 허용) |
| DB 연결 실패 | Railway의 DATABASE_URL이 Supabase Connection string과 일치하는지 확인 |
