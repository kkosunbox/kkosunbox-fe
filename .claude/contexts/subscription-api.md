Subscription ​Copy link
SubscriptionOperations
get
/v1/subscriptions/plans
post
/v1/subscriptions
get
/v1/subscriptions
delete
/v1/subscriptions/{subscriptionId}
post
/v1/subscriptions/{subscriptionId}/reactivate
get
/v1/subscriptions/payments
post
/v1/subscriptions/{subscriptionId}/plan/change
patch
/v1/subscriptions/{subscriptionId}/delivery-address
get
/v1/subscriptions/payment/{id}/receipt
post
/v1/subscriptions/coupon/info
구독 플랜 목록 조회​Copy link
profileId를 전달하면 해당 프로필의 체크리스트 답변 기반으로 isRecommended 값이 설정됩니다.

Query Parameters
profileIdCopy link to profileId
Type:number
애견 프로필 ID (추천 플랜 표시용)

Responses

200
application/json
Type:object
data
Type:object · SubscriptionPlanListResponse
Hide Child Attributesfor data
plans
Type:array object[] · SubscriptionPlanDto[]
required
플랜 목록

Hide Child Attributesfor plans
id
Type:number
required
플랜 ID

isRecommended
Type:boolean
required
프로필 체크리스트 기반 추천 여부 (profileId 전달 시 유효)

monthlyPrice
Type:number
required
월간 가격

name
Type:string
required
플랜 이름

sortOrder
Type:number
required
정렬 순서

description
Type:string
플랜 설명

result
Type:boolean
Example
Request Example forget/v1/subscriptions/plans
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/plans


Test Request
(get /v1/subscriptions/plans)
Status:200
{
  "result": true,
  "data": {
    "plans": []
  }
}

구독 시작​Copy link
빌링키가 등록된 상태에서 구독을 생성합니다. 첫 결제는 선택한 billingDate에 자동으로 청구됩니다. billingDate는 오늘로부터 최소 7일 이후여야 합니다. couponCode를 전달하면 첫 결제에 할인율이 적용됩니다.

Body
required
application/json
billingDateCopy link to billingDate
Type:string
required
Example
첫 결제일 (YYYY-MM-DD). 오늘로부터 최소 3일 이후여야 합니다.

deliveryAddressIdCopy link to deliveryAddressId
Type:number
required
배송지 ID

petProfileIdCopy link to petProfileId
Type:number
required
애견 프로필 ID

planIdCopy link to planId
Type:number
required
플랜 ID

couponCodeCopy link to couponCode
Type:string
할인 쿠폰 코드 (선택)

Responses

200
application/json
Type:object
data
Type:object · CreateSubscriptionResponse
Hide Child Attributesfor data
subscription
Type:object · UserSubscriptionDto
required
구독 정보

Hide Child Attributesfor subscription
deliveryAddressId
Type:number
required
배송지 ID

id
Type:number
required
구독 ID

isActive
Type:boolean
required
활성 상태 여부

nextBillingDate
Type:string
required
다음 결제일 (YYYY-MM-DD)

petProfileId
Type:number
required
애견 프로필 ID

plan
Type:object · SubscriptionPlanDto
required
플랜 정보

Hide Child Attributesfor plan
id
Type:number
required
플랜 ID

isRecommended
Type:boolean
required
프로필 체크리스트 기반 추천 여부 (profileId 전달 시 유효)

monthlyPrice
Type:number
required
월간 가격

name
Type:string
required
플랜 이름

sortOrder
Type:number
required
정렬 순서

description
Type:string
플랜 설명

status
Type:string
enum
required
구독 상태

values
active
cancelled
paymentFailed
suspended
userId
Type:number
required
유저 ID

cancelledAt
Type:string
Format:date-time
구독 취소 시각

result
Type:boolean
Example

400
application/json
Possible error codes: INVALID_BILLING_KEY, BAD_REQUEST, INVALID_COUPON, COUPON_EXPIRED

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_PLAN_NOT_FOUND, CONTENT_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forpost/v1/subscriptions
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "petProfileId": 1,
  "deliveryAddressId": 1,
  "planId": 1,
  "billingDate": "2026-03-26",
  "couponCode": ""
}'


Test Request
(post /v1/subscriptions)
Status:200
Status:400
Status:401
Status:404
{
  "result": true,
  "data": {
    "subscription": null
  }
}

내 구독 목록 조회​Copy link
Responses

200
application/json
Type:object
data
Type:object · SubscriptionListResponse
Hide Child Attributesfor data
subscriptions
Type:array object[] · UserSubscriptionDto[]
required
구독 목록

Hide Child Attributesfor subscriptions
deliveryAddressId
Type:number
required
배송지 ID

id
Type:number
required
구독 ID

isActive
Type:boolean
required
활성 상태 여부

nextBillingDate
Type:string
required
다음 결제일 (YYYY-MM-DD)

petProfileId
Type:number
required
애견 프로필 ID

plan
Type:object · SubscriptionPlanDto
required
플랜 정보

Hide Child Attributesfor plan
id
Type:number
required
플랜 ID

isRecommended
Type:boolean
required
프로필 체크리스트 기반 추천 여부 (profileId 전달 시 유효)

monthlyPrice
Type:number
required
월간 가격

name
Type:string
required
플랜 이름

sortOrder
Type:number
required
정렬 순서

description
Type:string
플랜 설명

status
Type:string
enum
required
구독 상태

values
active
cancelled
paymentFailed
suspended
userId
Type:number
required
유저 ID

cancelledAt
Type:string
Format:date-time
구독 취소 시각

result
Type:boolean
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forget/v1/subscriptions
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'


Test Request
(get /v1/subscriptions)
Status:200
Status:401
{
  "result": true,
  "data": {
    "subscriptions": []
  }
}

구독 취소​Copy link
구독이 즉시 취소됩니다.

Path Parameters
subscriptionIdCopy link to subscriptionId
Type:number
required
Responses

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example fordelete/v1/subscriptions/{subscriptionId}
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/1 \
  --request DELETE \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'


Test Request
(delete /v1/subscriptions/{subscriptionId})
Status:401
Status:404
{
  "result": false,
  "code": "MISSING_AUTHENTICATION_TOKEN",
  "message": "MISSING_AUTHENTICATION_TOKEN",
  "traceId": "d3274e1f-2140-4ebe-b1bf-a7120d77f208"
}

Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

구독 재활성화​Copy link
취소한 구독을 다시 활성화합니다.

Path Parameters
subscriptionIdCopy link to subscriptionId
Type:number
required
Responses

400
application/json
Possible error codes: INVALID_BILLING_KEY

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

402
application/json
Possible error codes: SUBSCRIPTION_EXPIRED, SUBSCRIPTION_INACTIVE

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forpost/v1/subscriptions/{subscriptionId}/reactivate
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/1/reactivate \
  --request POST \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'


Test Request
(post /v1/subscriptions/{subscriptionId}/reactivate)
Status:400
Status:401
Status:402
Status:404
{
  "result": false,
  "code": "INVALID_BILLING_KEY",
  "message": "INVALID_BILLING_KEY",
  "traceId": "d3274e1f-2140-4ebe-b1bf-a7120d77f208"
}

Possible error codes: INVALID_BILLING_KEY

결제 이력 조회​Copy link
Responses

200
application/json
Type:object
data
Type:object · PaymentHistoryResponse
Hide Child Attributesfor data
payments
Type:array object[] · SubscriptionPaymentDto[]
required
결제 이력

Hide Child Attributesfor payments
amount
Type:number
required
최종 결제 금액 (부가세 포함)

baseAmount
Type:number
required
기본 금액 (부가세 제외)

createdAt
Type:string
Format:date-time
required
생성일

id
Type:number
required
결제 ID

status
Type:string
enum
required
결제 상태

values
pending
completed
failed
refunded
partially_refunded
subscriptionId
Type:number
required
구독 ID

taxAmount
Type:number
required
부가세 금액 (10%)

approvedAt
Type:string
Format:date-time
결제 승인 시각

failureReason
Type:string
결제 실패 사유

method
Type:string
결제 방법

paymentType
Type:string
enum
결제 종류

values
initial
renewal
upgrade
planName
Type:string
플랜 이름 (스냅샷)

result
Type:boolean
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forget/v1/subscriptions/payments
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/payments \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'


Test Request
(get /v1/subscriptions/payments)
Status:200
Status:401
{
  "result": true,
  "data": {
    "payments": []
  }
}

플랜 변경​Copy link
플랜을 변경합니다. 변경 사항은 다음 결제일에 반영됩니다.

Path Parameters
subscriptionIdCopy link to subscriptionId
Type:number
required
Body
required
application/json
newPlanIdCopy link to newPlanId
Type:number
required
새 플랜 ID

Responses

200
application/json
Type:object
data
Type:object · ChangePlanResponse
Hide Child Attributesfor data
subscription
Type:object · UserSubscriptionDto
required
구독 정보

Hide Child Attributesfor subscription
deliveryAddressId
Type:number
required
배송지 ID

id
Type:number
required
구독 ID

isActive
Type:boolean
required
활성 상태 여부

nextBillingDate
Type:string
required
다음 결제일 (YYYY-MM-DD)

petProfileId
Type:number
required
애견 프로필 ID

plan
Type:object · SubscriptionPlanDto
required
플랜 정보

Hide Child Attributesfor plan
id
Type:number
required
플랜 ID

isRecommended
Type:boolean
required
프로필 체크리스트 기반 추천 여부 (profileId 전달 시 유효)

monthlyPrice
Type:number
required
월간 가격

name
Type:string
required
플랜 이름

sortOrder
Type:number
required
정렬 순서

description
Type:string
플랜 설명

status
Type:string
enum
required
구독 상태

values
active
cancelled
paymentFailed
suspended
userId
Type:number
required
유저 ID

cancelledAt
Type:string
Format:date-time
구독 취소 시각

result
Type:boolean
Example

400
application/json
Possible error codes: BAD_REQUEST

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_NOT_FOUND, SUBSCRIPTION_PLAN_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forpost/v1/subscriptions/{subscriptionId}/plan/change
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/1/plan/change \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "newPlanId": 1
}'


Test Request
(post /v1/subscriptions/{subscriptionId}/plan/change)
Status:200
Status:400
Status:401
Status:404
{
  "result": true,
  "data": {
    "subscription": null
  }
}

구독 배송지 변경​Copy link
구독에 연결된 배송지를 변경합니다

Path Parameters
subscriptionIdCopy link to subscriptionId
Type:number
required
Body
required
application/json
deliveryAddressIdCopy link to deliveryAddressId
Type:number
required
새 배송지 ID

Responses

200
application/json
Type:object
data
Type:object · UserSubscriptionDto
Hide Child Attributesfor data
deliveryAddressId
Type:number
required
배송지 ID

id
Type:number
required
구독 ID

isActive
Type:boolean
required
활성 상태 여부

nextBillingDate
Type:string
required
다음 결제일 (YYYY-MM-DD)

petProfileId
Type:number
required
애견 프로필 ID

plan
Type:object · SubscriptionPlanDto
required
플랜 정보

Hide Child Attributesfor plan
id
Type:number
required
플랜 ID

isRecommended
Type:boolean
required
프로필 체크리스트 기반 추천 여부 (profileId 전달 시 유효)

monthlyPrice
Type:number
required
월간 가격

name
Type:string
required
플랜 이름

sortOrder
Type:number
required
정렬 순서

description
Type:string
플랜 설명

status
Type:string
enum
required
구독 상태

values
active
cancelled
paymentFailed
suspended
userId
Type:number
required
유저 ID

cancelledAt
Type:string
Format:date-time
구독 취소 시각

result
Type:boolean
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_NOT_FOUND, CONTENT_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forpatch/v1/subscriptions/{subscriptionId}/delivery-address
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/1/delivery-address \
  --request PATCH \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "deliveryAddressId": 1
}'


Test Request
(patch /v1/subscriptions/{subscriptionId}/delivery-address)
Status:200
Status:401
Status:404
{
  "result": true,
  "data": {
    "id": 1,
    "userId": 1,
    "petProfileId": 1,
    "deliveryAddressId": 1,
    "plan": null,
    "status": "active",
    "nextBillingDate": "string",
    "cancelledAt": "2026-04-09T05:05:55.028Z",
    "isActive": true
  }
}

결제 영수증 PDF 생성​Copy link
특정 결제 내역의 영수증을 PDF로 생성하여 S3에 업로드하고 URL을 반환합니다.

Path Parameters
idCopy link to id
Type:string
required
Responses

200
application/json
Type:object
data
Type:object · PaymentReceiptResponse
Hide Child Attributesfor data
receiptUrl
Type:string
required
Example
영수증 PDF URL

result
Type:boolean
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: PAYMENT_NOT_FOUND, SUBSCRIPTION_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forget/v1/subscriptions/payment/{id}/receipt
Shell Curl
curl 'https://api-dev.kkosunbox.com/v1/subscriptions/payment/{id}/receipt' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'


Test Request
(get /v1/subscriptions/payment/{id}/receipt)
Status:200
Status:401
Status:404
{
  "result": true,
  "data": {
    "receiptUrl": "https://s3.amazonaws.com/bucket/receipts/1/123_1234567890.pdf"
  }
}

쿠폰 정보 조회​Copy link
쿠폰 코드를 입력하여 정보를 조회합니다.

Body
required
application/json
codeCopy link to code
Type:string
max length:  
30
required
쿠폰 코드 (최대 30자, 대소문자 구분 안함)

Responses

200
application/json
Type:object
data
Type:object · GetCouponInfoResponse
Hide Child Attributesfor data
canUse
Type:boolean
required
쿠폰 사용 가능 여부

discountRate
Type:number
required
할인율 (1~100, 단위: %)

description
Type:string
쿠폰 설명

endDate
Type:string
Format:date-time
쿠폰 사용 종료 시간 (null이면 제한 없음)

name
Type:string
쿠폰 이름

startDate
Type:string
Format:date-time
쿠폰 사용 시작 시간 (null이면 제한 없음)

unavailableReason
Type:string
사용 불가 사유 (사용 가능한 경우 null)

result
Type:boolean
Example

400
application/json
Possible error codes: INVALID_COUPON

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

401
application/json
Possible error codes: MISSING_AUTHENTICATION_TOKEN, UNAUTHORIZED, INVALID_ACCESS_TOKEN

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example

404
application/json
Possible error codes: SUBSCRIPTION_PLAN_NOT_FOUND

Type:object
code
Type:string
Example
message
Type:string
Example
result
Type:boolean
Example
traceId
Type:string
Example
Request Example forpost/v1/subscriptions/coupon/info
Shell Curl
curl https://api-dev.kkosunbox.com/v1/subscriptions/coupon/info \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "code": ""
}'


Test Request
(post /v1/subscriptions/coupon/info)
Status:200
Status:400
Status:401
Status:404
{
  "result": true,
  "data": {
    "name": "string",
    "description": "string",
    "discountRate": 1,
    "startDate": "2026-04-09T05:05:55.028Z",
    "endDate": "2026-04-09T05:05:55.028Z",
    "canUse": true,
    "unavailableReason": "string"
  }
}