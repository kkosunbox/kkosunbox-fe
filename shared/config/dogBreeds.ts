export interface DogBreedItem {
  name: string;
  englishName: string;
  aliases?: string[];
}

export type DogBreedOption = DogBreedItem;

export const MIX_BREED_NAME = "믹스견(기타)";

const BREEDS: DogBreedItem[] = [
  // ㄱ
  { name: "골든 리트리버", englishName: "Golden Retriever" },
  { name: "골든두들", englishName: "Goldendoodle", aliases: ["골든 두들"] },
  { name: "그레이트 덴", englishName: "Great Dane" },
  { name: "그레이하운드", englishName: "Greyhound" },
  // ㄲ
  { name: "꼬똥 드 툴레아", englishName: "Coton de Tulear" },
  // ㄴ
  { name: "네오폴리탄 마스티프", englishName: "Neapolitan Mastiff", aliases: ["나폴리탄 마스티프"] },
  { name: "노르위전 엘크하운드", englishName: "Norwegian Elkhound", aliases: ["노르위전 엘크하운드 그레이", "노르위전 엘크하운드 블랙"] },
  { name: "노리치 테리어", englishName: "Norwich Terrier" },
  { name: "노퍽 테리어", englishName: "Norfolk Terrier", aliases: ["노르포크 테리어"] },
  { name: "뉴펀들랜드", englishName: "Newfoundland" },
  // ㄷ
  { name: "닥스훈트", englishName: "Dachshund" },
  { name: "달마시안", englishName: "Dalmatian" },
  { name: "댄디 딘몬트 테리어", englishName: "Dandie Dinmont Terrier" },
  { name: "도고 아르헨티노", englishName: "Dogo Argentino" },
  { name: "도베르만", englishName: "Dobermann", aliases: ["도베르만 핀셔"] },
  { name: "동경견", englishName: "Donggyeongi", aliases: ["경주개", "동경이"] },
  { name: "디어하운드", englishName: "Deerhound" },
  // ㄹ
  { name: "라브라두들", englishName: "Labradoodle", aliases: ["래브라두들", "라브라도 푸들"] },
  { name: "라브라도 리트리버", englishName: "Labrador Retriever", aliases: ["래브라도 리트리버"] },
  { name: "라사 압소", englishName: "Lhasa Apso" },
  { name: "라이카", englishName: "Laika", aliases: ["러시안 라이카"] },
  { name: "라지 먼스터랜더", englishName: "Large Munsterlander" },
  { name: "래빗 닥스훈트", englishName: "Rabbit Dachshund", aliases: ["카닌헨 닥스훈트"] },
  { name: "랫 테리어", englishName: "Rat Terrier" },
  { name: "러프 콜리", englishName: "Collie Rough" },
  { name: "레온베르거", englishName: "Leonberger" },
  { name: "레이크랜드 테리어", englishName: "Lakeland Terrier" },
  { name: "로디지안 리즈백", englishName: "Rhodesian Ridgeback" },
  { name: "로트와일러", englishName: "Rottweiler" },
  // ㅁ
  { name: "마리노이즈", englishName: "Belgian Malinois", aliases: ["말리노이즈", "벨기에 말리노이즈", "벨지안 말리노이즈"] },
  { name: "마스티프", englishName: "Mastiff" },
  { name: "말티즈", englishName: "Maltese" },
  { name: "말티푸", englishName: "Maltipoo", aliases: ["말티포", "말티즈 푸들"] },
  { name: "맨체스터 테리어", englishName: "Manchester Terrier" },
  { name: "미니어쳐 닥스훈트", englishName: "Miniature Dachshund", aliases: ["미니어처 닥스훈트", "미니 닥스훈트"] },
  { name: "미니어쳐 불 테리어", englishName: "Miniature Bull Terrier", aliases: ["미니어처 불 테리어"] },
  { name: "미니어쳐 슈나우저", englishName: "Miniature Schnauzer", aliases: ["미니어처 슈나우저"] },
  { name: "미니어쳐 푸들", englishName: "Miniature Poodle", aliases: ["미니 푸들", "미니푸들"] },
  { name: "미니어쳐 핀셔", englishName: "Miniature Pinscher", aliases: ["미니어처 핀셔"] },
  { name: "미디엄 푸들", englishName: "Medium Poodle", aliases: ["미디엄푸들"] },
  { name: "미텔 스피츠", englishName: "Mittelspitz", aliases: ["미들 스피츠", "독일 스피츠 미텔"] },
  // ㅂ
  { name: "바센지", englishName: "Basenji" },
  { name: "바셋 하운드", englishName: "Basset Hound" },
  { name: "바이마라너", englishName: "Weimaraner" },
  { name: "버니즈 마운틴 독", englishName: "Bernese Mountain Dog" },
  { name: "베들링턴 테리어", englishName: "Bedlington Terrier" },
  { name: "벨지안 셰퍼드 독", englishName: "Belgian Shepherd Dog" },
  { name: "보더 콜리", englishName: "Border Collie" },
  { name: "보르조이", englishName: "Borzoi" },
  { name: "보스턴 테리어", englishName: "Boston Terrier" },
  { name: "복서", englishName: "Boxer" },
  { name: "부비에 데 플랑드르", englishName: "Bouvier des Flandres" },
  { name: "불 테리어", englishName: "Bull Terrier" },
  { name: "불독", englishName: "Bulldog" },
  { name: "불마스티프", englishName: "Bullmastiff" },
  { name: "브뤼셀 그리폰", englishName: "Griffon Bruxellois", aliases: ["브뤼셀그리펀", "브뤼셀 그리펀"] },
  { name: "브리타니 스파니엘", englishName: "Brittany Spaniel" },
  { name: "블랙 앤 탄 쿤 하운드", englishName: "Black and Tan Coonhound" },
  { name: "블러드하운드", englishName: "Bloodhound" },
  { name: "비글", englishName: "Beagle" },
  { name: "비숑 프리제", englishName: "Bichon Frise" },
  { name: "비숑푸", englishName: "Bichon-poo", aliases: ["비숑 푸들"] },
  { name: "비어디드 콜리", englishName: "Bearded Collie" },
  { name: "비즐라", englishName: "Vizsla" },
  // ㅃ
  { name: "빠삐용", englishName: "Papillon" },
  { name: "쁘띠 바셋 그리폰 벤딘", englishName: "Petit Basset Griffon Vendeen" },
  // ㅅ
  { name: "사모예드", englishName: "Samoyed", aliases: ["사모에드"] },
  { name: "살루키", englishName: "Saluki" },
  { name: "삽살개", englishName: "Sapsal Dog", aliases: ["삽살이"] },
  { name: "세인트 버나드", englishName: "Saint Bernard", aliases: ["세인트버나드"] },
  { name: "셔틀랜드 쉽독", englishName: "Shetland Sheepdog", aliases: ["셀티"] },
  { name: "스무스 콜리", englishName: "Collie Smooth" },
  { name: "스코티쉬 테리어", englishName: "Scottish Terrier", aliases: ["스코티"] },
  { name: "스탠다드 슈나우저", englishName: "Standard Schnauzer" },
  { name: "스탠다드 푸들", englishName: "Standard Poodle", aliases: ["표준 푸들"] },
  { name: "시바", englishName: "Shiba", aliases: ["시바 이누", "시바견"] },
  { name: "시베리안 허스키", englishName: "Siberian Husky" },
  { name: "시추푸", englishName: "Shih-poo", aliases: ["시추 푸들"] },
  { name: "시츄", englishName: "Shih Tzu", aliases: ["시추"] },
  { name: "시코쿠", englishName: "Shikoku" },
  // ㅇ
  { name: "아메리칸 스태포드셔 테리어", englishName: "American Staffordshire Terrier" },
  { name: "아메리칸 아키타", englishName: "American Akita" },
  { name: "아메리칸 코커 스파니엘", englishName: "American Cocker Spaniel", aliases: ["아메리칸 코카 스파니엘"] },
  { name: "아이리쉬 레드 세터", englishName: "Irish Red Setter", aliases: ["아이리시 레드 세터"] },
  { name: "아이리쉬 레드 앤 화이트 세터", englishName: "Irish Red and White Setter", aliases: ["아이리시 레드 앤 화이트 세터"] },
  { name: "아이리쉬 워터 스파니엘", englishName: "Irish Water Spaniel", aliases: ["아이리시 워터 스파니엘"] },
  { name: "아이리쉬 울프하운드", englishName: "Irish Wolfhound", aliases: ["아이리시 울프하운드"] },
  { name: "아이리쉬소프트 코티드 휘튼 테리어", englishName: "Irish Soft Coated Wheaten Terrier", aliases: ["아이리쉬 소프트 코티드 휘튼 테리어", "아이리쉬소프트코티드휘튼테리어", "아이리시소프트 코티드 휘튼 테리어", "아이리시 소프트 코티드 휘튼 테리어"] },
  { name: "아자와크", englishName: "Azawakh" },
  { name: "아키타", englishName: "Akita", aliases: ["아키다"] },
  { name: "아펜핀셔", englishName: "Affenpinscher" },
  { name: "아프간 하운드", englishName: "Afghan Hound" },
  { name: "알라스칸 말라뮤트", englishName: "Alaskan Malamute", aliases: ["말라뮤트"] },
  { name: "에어데일 테리어", englishName: "Airedale Terrier", aliases: ["에어델 테리어"] },
  { name: "오스트레일리언 셰퍼드", englishName: "Australian Shepherd", aliases: ["오스트랄리안 셰퍼드", "오스트레일리안 셰퍼드"] },
  { name: "오스트레일리언 캐틀 독", englishName: "Australian Cattle Dog", aliases: ["오스트랄리안 캐틀 독", "오스트레일리안 캐틀 독"] },
  { name: "올드 잉글리쉬 쉽독", englishName: "Old English Sheepdog", aliases: ["올드 잉글리시 쉽독"] },
  { name: "요크셔 테리어", englishName: "Yorkshire Terrier", aliases: ["요키", "요크셔"] },
  { name: "웨스트 하이랜드 화이트 테리어", englishName: "West Highland White Terrier", aliases: ["웨스티"] },
  { name: "웰시 코기 카디건", englishName: "Welsh Corgi Cardigan", aliases: ["카디건 웰시 코기"] },
  { name: "웰시 코기 펨브로크", englishName: "Welsh Corgi Pembroke", aliases: ["펨브로크 웰시 코기"] },
  { name: "이탈리언 사이트하운드", englishName: "Italian Sighthound", aliases: ["이탈리언 그레이하운드", "이탈리안 사이트하운드", "이탈리안 그레이하운드"] },
  { name: "일본 스피츠", englishName: "Japanese Spitz", aliases: ["스피츠", "재패니즈 스피츠"] },
  { name: "잉글리쉬 세터", englishName: "English Setter", aliases: ["잉글리시 세터"] },
  { name: "잉글리쉬 스프링거 스파니엘", englishName: "English Springer Spaniel", aliases: ["잉글리시 스프링거 스파니엘"] },
  { name: "잉글리쉬 코커 스파니엘", englishName: "English Cocker Spaniel", aliases: ["잉글리시 코커 스파니엘"] },
  { name: "잉글리쉬 포인터", englishName: "English Pointer", aliases: ["잉글리시 포인터"] },
  // ㅈ
  { name: "자이언트 슈나우저", englishName: "Giant Schnauzer", aliases: ["자이언트 슈나우져", "자이언트 슈나유져"] },
  { name: "잭 러셀 테리어", englishName: "Jack Russell Terrier" },
  { name: "저먼 셰퍼드 독", englishName: "German Shepherd Dog", aliases: ["독일 셰퍼드"] },
  { name: "저먼 숏 헤어드 포인팅 독", englishName: "German Short-Haired Pointing Dog" },
  { name: "키스혼드", englishName: "Keeshond", aliases: ["키스혼트", "저먼 스피츠 키스혼드"] },
  { name: "토이 스피츠", englishName: "German Spitz (Toy)", aliases: ["저먼 스피츠 토이"] },
  { name: "포메라니언", englishName: "Pomeranian", aliases: ["포메라니안", "포메"] },
  { name: "저먼 와이어 헤어드 포인팅 독", englishName: "German Wire-Haired Pointing Dog" },
  { name: "저먼 헌팅 테리어", englishName: "German Hunting Terrier" },
  { name: "진도견", englishName: "Jindo", aliases: ["진돗개", "진도개", "코리아 진도 독"] },
  // ㅊ
  { name: "차우차우", englishName: "Chow Chow" },
  { name: "차이니즈 크레스티드 독", englishName: "Chinese Crested Dog" },
  { name: "체코슬로바키안 울프독", englishName: "Czechoslovakian Wolfdog" },
  { name: "치와와", englishName: "Chihuahua" },
  // ㅋ
  { name: "캐벌리어 킹 찰스 스파니엘", englishName: "Cavalier King Charles Spaniel" },
  { name: "케리 블루 테리어", englishName: "Kerry Blue Terrier" },
  { name: "케언 테리어", englishName: "Cairn Terrier" },
  { name: "코몬도르", englishName: "Komondor" },
  { name: "코카푸", englishName: "Cockapoo", aliases: ["코커푸"] },
  { name: "키슈", englishName: "Kishu" },
  { name: "킹 찰스 스파니엘", englishName: "King Charles Spaniel" },
  // ㅌ
  { name: "토이 푸들", englishName: "Toy Poodle", aliases: ["푸들", "토이푸들"] },
  { name: "티베탄 테리어", englishName: "Tibetan Terrier" },
  // ㅍ
  { name: "파라오 하운드", englishName: "Pharaoh Hound" },
  { name: "파슨 러셀 테리어", englishName: "Parson Russell Terrier" },
  { name: "퍼그", englishName: "Pug" },
  { name: "페키니즈", englishName: "Pekingese" },
  { name: "포르투기즈 워터 독", englishName: "Portuguese Water Dog" },
  { name: "포머스키", englishName: "Pomsky", aliases: ["폼스키"] },
  { name: "포메치", englishName: "Pomchi", aliases: ["포메라니안 치와와"] },
  { name: "풀리", englishName: "Puli" },
  { name: "풍산개", englishName: "Pungsan Dog" },
  { name: "프레사 까나리오", englishName: "Presa Canario", aliases: ["도고 까나리오"] },
  { name: "프렌치 불독", englishName: "French Bulldog" },
  { name: "플랫 코티드 리트리버", englishName: "Flat-Coated Retriever" },
  { name: "피레니언 마운틴 독", englishName: "Pyrenean Mountain Dog", aliases: ["그레이트 피레니즈"] },
  // ㅎ
  { name: "해리어", englishName: "Harrier" },
  { name: "호카이도", englishName: "Hokkaido" },
  { name: "휘핏", englishName: "Whippet", aliases: ["휘펫"] },
];

// 소스 배열은 ㄱㄴㄷ 순으로 작성되어 있으며, sort는 향후 추가분을 위한 안전망
export const DOG_BREEDS: DogBreedOption[] = [...BREEDS].sort((a, b) =>
  a.name.localeCompare(b.name, "ko"),
);

export const MIX_BREED_OPTION: DogBreedOption = {
  name: MIX_BREED_NAME,
  englishName: "Mix",
  aliases: ["믹스", "기타", "잡종"],
};

export const DOG_BREED_OPTIONS: DogBreedOption[] = [...DOG_BREEDS, MIX_BREED_OPTION];
