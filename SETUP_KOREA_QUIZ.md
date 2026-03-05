# korea-quiz GitHub + Vercel 설정

## 1. GitHub에 korea-quiz 레포 만들기

1. [github.com](https://github.com) → 로그인
2. 오른쪽 상단 **+** → **New repository**
3. 설정:
   - **Repository name**: `korea-quiz`
   - **Public** 선택
   - **Add a README file** 체크 해제 (이미 로컬에 코드가 있음)
4. **Create repository** 클릭

---

## 2. 로컬에서 push (아래 명령 실행)

GitHub에서 `korea-quiz` 레포를 만든 뒤, 터미널에서:

```bash
cd "/Users/changhwanlee/Desktop/Next-Tailwind 2"

# 1. 새 원격 추가
git remote add korea-quiz https://github.com/leechang1811-afk/korea-quiz.git

# 2. 변경사항 추가 & 커밋
git add .
git commit -m "korea-quiz: 나는 한국 상위 몇%? 앱"

# 3. korea-quiz 레포로 push
git push -u korea-quiz main
```

---

## 3. Vercel에 프로젝트 연결

1. [vercel.com](https://vercel.com) → 로그인 (GitHub)
2. **Add New** → **Project**
3. **Import**에서 `leechang1811-afk/korea-quiz` 선택
4. **Configure**:
   - Framework: Vite (자동 감지될 수 있음)
   - Root Directory: `.`
   - Build Command: `pnpm run build:client`
   - Output Directory: `apps/client/dist`
   - **Environment Variables**에서 `VITE_API_URL` 추가 (Railway URL 나중에 입력 가능)
5. **Deploy** 클릭

---

## 참고

- Mafia-game 레포는 그대로 유지됨 (origin은 변경하지 않음)
- 백엔드(Railway) 배포 후 `VITE_API_URL`을 Vercel에서 다시 설정하고 Redeploy
