# Enkostay Filter Demo

엔코스테이 필터와 500개의 가상 숙소로 만든 인터랙티브 프로토타입입니다. 실제 엔코스테이 매물이나 검색 API에는 연결되지 않습니다. 이메일 계정, 개인 찜·장바구니·필터 저장, 관리자 기능을 사용하려면 Supabase 프로젝트를 연결해야 합니다.

## 로컬에서 실행

```sh
npm install
npm run dev
```

Supabase 연결 전에도 필터 데모는 사용할 수 있습니다. 계정 기능을 켜려면 프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```env
VITE_SUPABASE_URL=https://프로젝트ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_값
```

`.env.local`은 Git에 올라가지 않도록 제외되어 있습니다. 브라우저에는 publishable key만 둡니다. Supabase secret/service role key는 어떤 경우에도 여기에 넣지 않습니다.

## Supabase 연결 및 보안 설정

1. [Supabase](https://supabase.com/dashboard)에서 프로젝트를 만듭니다.
2. Supabase **SQL Editor**에서 `supabase/migrations/202611210001_user_workspace.sql` 내용을 실행합니다. 사용자별 RLS 정책과 기본 프로필 생성 트리거가 설정됩니다.
3. **Authentication → URL Configuration**은 `supabase/config.toml`의 Site URL과 Redirect URLs를 반영합니다. 이메일 인증은 Authentication의 Email provider 설정을 확인합니다.
4. Mac의 VS Code 터미널에서 프로젝트 폴더를 연 뒤 다음 명령을 실행합니다. `PROJECT_REF`는 Supabase **Project Settings → General**에 표시된 프로젝트 ID입니다.

   ```sh
   npx supabase login
   npx supabase link --project-ref PROJECT_REF
   npx supabase functions deploy admin-users
   ```

   관리자 함수는 로그인 세션과 `admin_users` 권한을 서버에서 검증합니다. Supabase가 Edge Function에 제공하는 service role key로 Auth 회원 목록·정지 상태를 관리하며, 이 키는 브라우저 코드에 포함하지 않습니다.
5. 배포된 사이트에서 본인 이메일로 회원가입하고 이메일 인증을 완료합니다. Supabase **SQL Editor**에서 아래 쿼리를 본인 이메일로 바꿔 실행해 관리자 계정을 지정합니다.

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = '본인 이메일 주소'
   on conflict (user_id) do nothing;
   ```

   가입 순서만으로 관리자 권한이 생기지 않습니다. 관리자 지정 후 다시 로그인하면 관리자 메뉴가 표시됩니다. 관리자 메뉴에서는 회원 이메일, 가입·최근 접속, 이메일 인증 상태를 보고 일반 회원 계정을 정지하거나 다시 활성화할 수 있습니다. 관리자가 아닌 계정은 서버 함수에서 거부됩니다. 회원의 찜·장바구니 데이터는 관리자 화면에서 노출하지 않습니다.

## GitHub Pages 배포

Supabase URL과 publishable key는 공개 키여서 GitHub Actions 배포 설정에서 사용합니다. 데이터 접근은 DB의 RLS 정책으로 제한됩니다. secret/service role key는 GitHub 변수나 프런트엔드 빌드에 넣지 않습니다. 키를 회전하면 `.github/workflows/deploy.yml`의 공개 키 값도 새 값으로 바꿉니다.

`main` 브랜치에 push하면 GitHub Actions가 빌드와 Pages 배포를 진행합니다.

## 개인 페이지 기능

- 이메일·비밀번호 회원가입 및 로그인, 이메일 확인, 비밀번호 재설정
- 계정별 찜 목록과 장바구니 저장
- 장바구니에서 최대 4개 가상 숙소 비교
- 현재 필터 설정과 1~5순위 가중치를 반영한 비교 점수 및 대주제별 표시
- 관리자 전용 회원 목록과 계정 로그인 정지·재활성화
- 로그인 회원의 필터 변경, 검색 적용 결과 수, 찜·장바구니·비교, 저장 필터 사용에 대한 관리자용 활동 통계와 회원별 타임라인

가상 숙소 데이터는 고정 seed로 생성되므로 새로고침 후에도 계정에 저장된 숙소 ID가 같은 샘플을 가리킵니다.


## 활동 기록 안내

로그인 상태에서 필터 메뉴 열기, 옵션·필수·우선순위·금액 범위 변경, 검색 적용 및 결과 수, 정렬, 찜·장바구니·비교, 저장 필터 사용 이벤트를 기록합니다. 관리자 화면에서 최근 90일 집계와 회원별 최근 활동을 확인할 수 있습니다. 기록은 해당 회원의 로그인 ID에 연결되며, 비밀번호와 자유 입력 문구는 저장하지 않습니다. 비로그인 상태의 탐색은 기록하지 않습니다.
