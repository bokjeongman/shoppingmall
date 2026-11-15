# THREAD & CO. — 의류 쇼핑몰

토스페이먼츠 결제창을 연동한 의존성 없는 의류 쇼핑몰 데모입니다. 순수 HTML/CSS/JS와 Node.js만 사용합니다.

## 주요 기능

- 상품 목록 (상의 / 하의 / 아우터 카테고리 필터)
- 장바구니 (수량 조절, 삭제, `localStorage` 저장)
- 토스페이먼츠 결제창 연동 및 서버 측 결제 승인
- 결제 성공 / 실패 페이지

## 폴더 구조

```
.
├── index.html       # 메인 페이지
├── app.js           # 상품 목록, 장바구니, 결제 요청
├── config.js        # 토스페이먼츠 클라이언트 키
├── style.css
├── success.html     # 결제 성공
├── fail.html        # 결제 실패
├── server.js        # 로컬 실행용 정적 서버 + 결제 승인 API
├── api/confirm.js   # Vercel 서버리스 함수 (배포 시 결제 승인)
└── vercel.json      # 보안 헤더 설정
```

## 실행 방법

Node.js 18 이상이 필요합니다. 별도 패키지 설치는 없습니다.

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com) → API 키에서 **테스트 키**를 확인합니다.
2. `config.js`의 클라이언트 키(`test_gck_...`)를 본인 키로 교체합니다. (기본값은 공개 문서용 키입니다.)
3. 시크릿 키를 환경변수로 설정하고 서버를 실행합니다.

```powershell
# Windows PowerShell
$env:TOSS_SECRET_KEY="test_gsk_..."
node server.js
```

```bash
# macOS / Linux
TOSS_SECRET_KEY="test_gsk_..." node server.js
```

4. 브라우저에서 http://localhost:3000 을 엽니다.

## 결제 흐름

1. 장바구니에서 결제하기를 누르면 토스 결제창이 열립니다.
2. 결제 완료 후 `success.html`로 이동하며 `paymentKey`, `orderId`, `amount`가 전달됩니다.
3. 클라이언트가 `POST /api/confirm`을 호출하고, 서버가 시크릿 키로 토스 승인 API를 호출합니다.

## Vercel 배포

1. [vercel.com/new](https://vercel.com/new)에서 이 저장소를 가져옵니다. (Framework Preset: Other, Root Directory: 기본값)
2. Settings → Environment Variables에 `TOSS_SECRET_KEY`(`test_gsk_...`)를 추가합니다.
3. 재배포하면 `/api/confirm`이 결제 승인을 처리합니다.

## 보안 주의

- 시크릿 키(`test_gsk_...`)는 **절대 코드나 저장소에 넣지 마세요.** `server.js`의 환경변수로만 사용합니다.
- 이 프로젝트는 **테스트 키 전용 데모**입니다. 실제 서비스에는 주문 DB 기반 금액 검증 등이 추가로 필요합니다.
- 상품 이미지는 Unsplash를 사용합니다.
