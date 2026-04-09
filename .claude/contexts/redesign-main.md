메인 페이지의 리디자인에 대한 개요를 제가 간략하게 작성해둔 문서입니다.
당신은 이 문서의 내용 외에 프롬프트와 주어진 피그마 기획 문서를 바탕으로 요구사항을 정확히 파악하여 작업을 진행해야합니다.

1. 추가된 파일들
hero-item-expanded.png
ingredients-detail-happy.png
pain-point-dogs.png

2. 주의할 점
신규 리디자인에서는 BenefitsSection.tsx 를 사용하지 않습니다.
HowItWorksSection 도 사용하지 않습니다만 해당 위치에 
리뷰 영역이 들어옵니다.
리뷰 영역에 대한 css 는 하단에 첨부하겠습니다.

/* Rectangle 4285 */

position: absolute;
width: 1920px;
height: 762px;
left: 0px;
top: 2571px;

background: linear-gradient(0deg, #FFF9F3 0%, #E3EEFF 100%);
transform: matrix(1, 0, 0, -1, 0, 0);


/* Group 1000005136 */

position: absolute;
width: 1011px;
height: 560px;
left: 455px;
top: 2657px;



/* Reviews card */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 84px 32px 32px;
gap: 24px;
isolation: isolate;

position: absolute;
width: 313px;
min-width: 300px;
height: 360px;
left: 455px;
top: 2857px;

background: #FFFFFF;
box-shadow: 0px 4px 10px rgba(82, 82, 82, 0.1);
border-radius: 16px;


/* Stars */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
align-items: center;
padding: 0px;

width: 120px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;
z-index: 0;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 4;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* 처음엔 가격대가 있어서 고민했는데 받아보고 생각 바뀌었어요. 포장부터 너무 깔끔하고 고급스럽고, 무엇보다 우리 강아지가 진짜 잘 먹어요. 평소 간식 가리던 아이인데 꼬순박스는 뜯자마자 달려오네요ㅎㅎ 재구독 의사 100%입니다! */

width: 249px;
height: 126px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 140%;
/* 또는 20px */

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;
z-index: 1;


/* Name */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 0px;
gap: 8px;

width: 249px;
height: 46px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
align-self: stretch;
flex-grow: 0;
z-index: 2;


/* 코코 (웰시코기) */

width: 112px;
height: 21px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 700;
font-size: 18px;
line-height: 21px;
text-align: center;

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* 구독 32일째, 프리미엄 */

width: 249px;
height: 17px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 500;
font-size: 14px;
line-height: 17px;
/* 상자 높이와 동일 */
text-align: center;

color: #777777;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
align-self: stretch;
flex-grow: 0;


/* Icon Strategy */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 17.71px 19.25px;
gap: 7.7px;

position: absolute;
width: 120px;
height: 120px;
left: calc(50% - 120px/2 + 0.5px);
top: -60px;

background: url(photo_2026-03-11_17-53-10.jpg);
border: 8px solid #FFFFFF;
border-radius: 60px;

/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;
z-index: 3;


/* Reviews card */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 84px 32px 32px;
gap: 24px;
isolation: isolate;

position: absolute;
width: 313px;
min-width: 300px;
height: 360px;
left: 804px;
top: 2857px;

background: #FFFFFF;
box-shadow: 0px 4px 10px rgba(82, 82, 82, 0.1);
border-radius: 16px;


/* Stars */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
align-items: center;
padding: 0px;

width: 120px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;
z-index: 0;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 4;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* 성분 보고 선택했는데 진짜 만족이에요. 불필요한 첨가물 없고 믿고 먹일 수 있어서 좋아요. 간식 종류도 다양해서 매번 새로운 느낌이라 강아지도 질려하지 않네요. 구독 서비스 중에서는 제일 만족스러워요. */

width: 249px;
height: 126px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 140%;
/* 또는 20px */

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;
z-index: 1;


/* Name */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 0px;
gap: 8px;

width: 249px;
height: 46px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
align-self: stretch;
flex-grow: 0;
z-index: 2;


/* 보리 (웰시코기) */

width: 112px;
height: 21px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 700;
font-size: 18px;
line-height: 21px;
text-align: center;

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* 구독 58일째, 스탠다드 */

width: 249px;
height: 17px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 500;
font-size: 14px;
line-height: 17px;
/* 상자 높이와 동일 */
text-align: center;

color: #777777;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
align-self: stretch;
flex-grow: 0;


/* Icon Strategy */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 17.71px 19.25px;
gap: 7.7px;

position: absolute;
width: 120px;
height: 120px;
left: calc(50% - 120px/2 + 0.5px);
top: -60px;

background: url(photo_2026-03-11_17-31-39.jpg);
border: 8px solid #FFFFFF;
border-radius: 60px;

/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;
z-index: 3;


/* Reviews card */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 84px 32px 32px;
gap: 24px;
isolation: isolate;

position: absolute;
width: 313px;
min-width: 300px;
height: 360px;
left: 1153px;
top: 2857px;

background: #FFFFFF;
box-shadow: 0px 4px 10px rgba(82, 82, 82, 0.1);
border-radius: 16px;


/* Stars */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
align-items: center;
padding: 0px;

width: 120px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;
z-index: 0;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* ic:baseline-star */

width: 24px;
height: 24px;


/* 내부 오토레이아웃 */
flex: none;
order: 4;
flex-grow: 0;


/* Vector */

position: absolute;
left: 8.33%;
right: 8.33%;
top: 8.33%;
bottom: 12.5%;

background: #FDD264;


/* 강아지 키우면서 간식 고민 많았는데 꼬순박스로 정착했어요. 매달 어떤 구성이 올지 기대하는 재미도 있고, 퀄리티가 확실히 일반 간식이랑 달라요. 주변 견주들한테도 추천 많이 하고 있어요 */

width: 249px;
height: 126px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 140%;
/* 또는 20px */

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
flex-grow: 0;
z-index: 1;


/* Name */

/* 오토레이아웃 */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 0px;
gap: 8px;

width: 249px;
height: 46px;


/* 내부 오토레이아웃 */
flex: none;
order: 2;
align-self: stretch;
flex-grow: 0;
z-index: 2;


/* 두부 (리트리버) */

width: 112px;
height: 21px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 700;
font-size: 18px;
line-height: 21px;
text-align: center;

color: #2C2C2C;


/* 내부 오토레이아웃 */
flex: none;
order: 0;
flex-grow: 0;


/* 구독 91일째, 프리미엄 */

width: 249px;
height: 17px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 500;
font-size: 14px;
line-height: 17px;
/* 상자 높이와 동일 */
text-align: center;

color: #777777;


/* 내부 오토레이아웃 */
flex: none;
order: 1;
align-self: stretch;
flex-grow: 0;


/* Icon Strategy */

/* 오토레이아웃 */
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 17.71px 19.25px;
gap: 7.7px;

position: absolute;
width: 120px;
height: 120px;
left: calc(50% - 120px/2 + 0.5px);
top: -60px;

background: url(premium_photo-1661951641996-3685492b78ed.jpg);
border: 8px solid #FFFFFF;
border-radius: 60px;

/* 내부 오토레이아웃 */
flex: none;
order: 3;
flex-grow: 0;
z-index: 3;


/* 실제 꼬순박스 패키지를 구매하신 고객님들의 생생한 리뷰입니다. */

position: absolute;
width: 391px;
height: 19px;
left: calc(50% - 391px/2 - 0.5px);
top: 2723px;

font-family: 'Pretendard';
font-style: normal;
font-weight: 500;
font-size: 16px;
line-height: 19px;
/* 상자 높이와 동일 */
text-align: center;
letter-spacing: -0.02em;

color: #917F71;



/* 생생한 리뷰를 확인하세요! */

position: absolute;
width: 412px;
height: 50px;
left: calc(50% - 412px/2 + 1px);
top: 2657px;

font-family: 'GangwonEduPower';
font-style: normal;
font-weight: 400;
font-size: 40px;
line-height: 50px;
/* 상자 높이와 동일 또는 125% */
text-align: center;
letter-spacing: -0.04em;
text-transform: capitalize;

color: #5C4634;

