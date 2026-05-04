export interface DogBreedItem {
  name: string;
  englishName: string;
  aliases?: string[];
}

export interface DogBreedGroup {
  id: number;
  name: string;
  englishName: string;
  breeds: DogBreedItem[];
}

export interface DogBreedOption extends DogBreedItem {
  groupId: number;
  groupName: string;
}

export const MIX_BREED_NAME = "어느 품종에도 속하지 않는 mix(기타)";

// Source: KKF public international breed list (gid 1-10).
// https://www.thekkf.or.kr/new_home/03_kkf_service/03_approval_2.php?gid=1
export const DOG_BREED_GROUPS: DogBreedGroup[] = [
  {
    id: 1,
    name: "쉽독, 캐틀독",
    englishName: "Sheepdogs and Cattledogs",
    breeds: [
      { name: "오스트레일리언 캐틀 독", englishName: "Australian Cattle Dog" },
      { name: "오스트레일리언 셰퍼드", englishName: "Australian Shepherd" },
      { name: "비어디드 콜리", englishName: "Bearded Collie" },
      { name: "보더 콜리", englishName: "Border Collie" },
      { name: "부비에 데 플랑드르", englishName: "Bouvier des Flandres" },
      { name: "벨지안 셰퍼드 독", englishName: "Belgian Shepherd Dog" },
      { name: "러프 콜리", englishName: "Collie Rough" },
      { name: "스무스 콜리", englishName: "Collie Smooth" },
      { name: "코몬도르", englishName: "Komondor" },
      { name: "올드 잉글리쉬 쉽독", englishName: "Old English Sheepdog" },
      { name: "풀리", englishName: "Puli" },
      { name: "저먼 셰퍼드 독", englishName: "German Shepherd Dog", aliases: ["독일 셰퍼드"] },
      { name: "웰시 코기 카디건", englishName: "Welsh Corgi Cardigan", aliases: ["카디건 웰시 코기"] },
      { name: "웰시 코기 펨브로크", englishName: "Welsh Corgi Pembroke", aliases: ["펨브로크 웰시 코기"] },
      { name: "셔틀랜드 쉽독", englishName: "Shetland Sheepdog", aliases: ["셀티"] },
      { name: "체코슬로바키안 울프독", englishName: "Czechoslovakian Wolfdog" },
    ],
  },
  {
    id: 2,
    name: "핀셔, 슈나우저, 몰로세르",
    englishName: "Pinscher and Schnauzer - Molossoid",
    breeds: [
      { name: "아펜핀셔", englishName: "Affenpinscher" },
      { name: "불독", englishName: "Bulldog" },
      { name: "불마스티프", englishName: "Bullmastiff" },
      { name: "버니즈 마운틴 독", englishName: "Bernese Mountain Dog" },
      { name: "복서", englishName: "Boxer" },
      { name: "도고 아르헨티노", englishName: "Dogo Argentino" },
      { name: "도베르만", englishName: "Dobermann", aliases: ["도베르만 핀셔"] },
      { name: "프레사 까나리오(구: 도고 까나리오)", englishName: "Presa Canario", aliases: ["프레사 까나리오", "도고 까나리오"] },
      { name: "그레이트 덴", englishName: "Great Dane" },
      { name: "피레니언 마운틴 독", englishName: "Pyrenean Mountain Dog", aliases: ["그레이트 피레니즈"] },
      { name: "자이언트 슈나우저", englishName: "Giant Schnauzer" },
      { name: "레온베르거", englishName: "Leonberger" },
      { name: "마스티프", englishName: "Mastiff" },
      { name: "미니어쳐 핀셔", englishName: "Miniature Pinscher", aliases: ["미니어처 핀셔"] },
      { name: "미니어쳐 슈나우저", englishName: "Miniature Schnauzer", aliases: ["미니어처 슈나우저"] },
      { name: "뉴펀들랜드", englishName: "Newfoundland" },
    ],
  },
  {
    id: 3,
    name: "테리어",
    englishName: "Terriers",
    breeds: [
      { name: "아메리칸 스태포드셔 테리어", englishName: "American Staffordshire Terrier" },
      { name: "에어데일 테리어", englishName: "Airedale Terrier" },
      { name: "베들링턴 테리어", englishName: "Bedlington Terrier" },
      { name: "불 테리어", englishName: "Bull Terrier" },
      { name: "케언 테리어", englishName: "Cairn Terrier" },
      { name: "댄디 딘몬트 테리어", englishName: "Dandie Dinmont Terrier" },
      { name: "저먼 헌팅 테리어", englishName: "German Hunting Terrier" },
      { name: "아이리쉬소프트 코티드 휘튼 테리어", englishName: "Irish Soft Coated Wheaten Terrier", aliases: ["아이리쉬 소프트 코티드 휘튼 테리어"] },
      { name: "잭 러셀 테리어", englishName: "Jack Russell Terrier" },
      { name: "케리 블루 테리어", englishName: "Kerry Blue Terrier" },
      { name: "레이크랜드 테리어", englishName: "Lakeland Terrier" },
      { name: "미니어쳐 불 테리어", englishName: "Miniature Bull Terrier", aliases: ["미니어처 불 테리어"] },
      { name: "맨체스터 테리어", englishName: "Manchester Terrier" },
      { name: "노퍽 테리어", englishName: "Norfolk Terrier" },
      { name: "노리치 테리어", englishName: "Norwich Terrier" },
      { name: "파슨 러셀 테리어", englishName: "Parson Russell Terrier" },
    ],
  },
  {
    id: 4,
    name: "닥스훈트",
    englishName: "Dachshunds",
    breeds: [
      { name: "닥스훈트", englishName: "Dachshund" },
    ],
  },
  {
    id: 5,
    name: "스피츠, 프리미티브 타입",
    englishName: "Spitz and primitive types",
    breeds: [
      { name: "호카이도", englishName: "Hokkaido" },
      { name: "알라스칸 말라뮤트", englishName: "Alaskan Malamute" },
      { name: "바센지", englishName: "Basenji" },
      { name: "차우차우", englishName: "Chow Chow" },
      { name: "아메리칸 아키타", englishName: "American Akita" },
      { name: "시베리안 허스키", englishName: "Siberian Husky" },
      { name: "코리아 진도 독", englishName: "Korea Jindo Dog", aliases: ["진돗개", "진도개"] },
      { name: "아키타", englishName: "Akita" },
      { name: "키슈", englishName: "Kishu" },
      { name: "시바", englishName: "Shiba", aliases: ["시바 이누", "시바견"] },
      { name: "시코쿠", englishName: "Shikoku" },
      { name: "저먼 스피츠 (키스혼드)", englishName: "German Spitz (Keeshond)" },
      { name: "노르위전 엘크하운드 (블랙)", englishName: "Norwegian Elkhound Black" },
      { name: "노르위전 엘크하운드 (그레이)", englishName: "Norwegian Elkhound Grey" },
      { name: "저먼 스피츠(토이 스피츠, 포메라니언)", englishName: "German Spitz (Pomeranian, Toy Spitz)", aliases: ["포메라니안", "포메라니언", "저먼 스피츠 토이"] },
      { name: "파라오 하운드", englishName: "Pharaoh Hound" },
    ],
  },
  {
    id: 6,
    name: "센트하운드, 관련 견종",
    englishName: "Scent hounds and related breeds",
    breeds: [
      { name: "비글", englishName: "Beagle" },
      { name: "바셋 하운드", englishName: "Basset Hound" },
      { name: "블랙 앤 탄 쿤 하운드", englishName: "Black and Tan Coonhound" },
      { name: "달마시안", englishName: "Dalmatian" },
      { name: "쁘띠 바셋 그리폰 벤딘", englishName: "Petit Basset Griffon Vendeen" },
      { name: "로디지안 리즈백", englishName: "Rhodesian Ridgeback" },
      { name: "블러드하운드", englishName: "Bloodhound" },
      { name: "해리어", englishName: "Harrier" },
    ],
  },
  {
    id: 7,
    name: "포인팅 독",
    englishName: "Pointing Dogs",
    breeds: [
      { name: "브리타니 스파니엘", englishName: "Brittany Spaniel" },
      { name: "잉글리쉬 포인터", englishName: "English Pointer" },
      { name: "잉글리쉬 세터", englishName: "English Setter" },
      { name: "저먼 숏 헤어드 포인팅 독", englishName: "German Short-Haired Pointing Dog" },
      { name: "저먼 와이어 헤어드 포인팅 독", englishName: "German Wire-Haired Pointing Dog" },
      { name: "아이리쉬 레드 앤 화이트 세터", englishName: "Irish Red and White Setter" },
      { name: "라지 먼스터랜더", englishName: "Large Munsterlander" },
      { name: "비즐라", englishName: "Vizsla" },
      { name: "바이마라너", englishName: "Weimaraner" },
      { name: "아이리쉬 레드 세터", englishName: "Irish Red Setter" },
    ],
  },
  {
    id: 8,
    name: "리트리버, 플러싱 독, 워터 독",
    englishName: "Retrievers - Flushing Dogs - Water Dogs",
    breeds: [
      { name: "아메리칸 코커 스파니엘", englishName: "American Cocker Spaniel" },
      { name: "잉글리쉬 코커 스파니엘", englishName: "English Cocker Spaniel" },
      { name: "플랫 코티드 리트리버", englishName: "Flat-Coated Retriever" },
      { name: "아이리쉬 워터 스파니엘", englishName: "Irish Water Spaniel" },
      { name: "래브라도 리트리버", englishName: "Labrador Retriever" },
      { name: "노바 스코샤 덕 톨링 리트리버", englishName: "Nova Scotia Duck Tolling Retriever" },
      { name: "포르투기즈 워터 독", englishName: "Portuguese Water Dog" },
      { name: "골든 리트리버", englishName: "Golden Retriever" },
      { name: "잉글리쉬 스프링거 스파니엘", englishName: "English Springer Spaniel" },
    ],
  },
  {
    id: 9,
    name: "반려견 및 토이독",
    englishName: "Companion and Toy Dogs",
    breeds: [
      { name: "비숑 프리제", englishName: "Bichon Frise" },
      { name: "브뤼셀 그리폰", englishName: "Griffon Bruxellois" },
      { name: "보스턴 테리어", englishName: "Boston Terrier" },
      { name: "차이니즈 크레스티드 독", englishName: "Chinese Crested Dog" },
      { name: "치와와", englishName: "Chihuahua" },
      { name: "프렌치 불독", englishName: "French Bulldog" },
      { name: "캐벌리어 킹 찰스 스파니엘", englishName: "Cavalier King Charles Spaniel" },
      { name: "킹 찰스 스파니엘", englishName: "King Charles Spaniel" },
      { name: "라사 압소", englishName: "Lhasa Apso" },
      { name: "말티즈", englishName: "Maltese" },
      { name: "퍼그", englishName: "Pug" },
      { name: "페키니즈", englishName: "Pekingese" },
      { name: "빠삐용", englishName: "Papillon" },
      { name: "시츄", englishName: "Shih Tzu", aliases: ["시추"] },
      { name: "꼬똥 드 툴레아", englishName: "Coton de Tulear" },
      { name: "티베탄 테리어", englishName: "Tibetan Terrier" },
    ],
  },
  {
    id: 10,
    name: "사이트 하운드",
    englishName: "Sighthounds",
    breeds: [
      { name: "아프간 하운드", englishName: "Afghan Hound" },
      { name: "보르조이", englishName: "Borzoi" },
      { name: "디어하운드", englishName: "Deerhound" },
      { name: "그레이하운드", englishName: "Greyhound" },
      { name: "아이리쉬 울프하운드", englishName: "Irish Wolfhound" },
      { name: "이탈리언 사이트하운드(구: 이탈리언 그레이하운드)", englishName: "Italian Sighthound", aliases: ["이탈리언 사이트하운드", "이탈리언 그레이하운드"] },
      { name: "살루키", englishName: "Saluki" },
      { name: "휘핏", englishName: "Whippet" },
      { name: "아자와크", englishName: "Azawakh" },
    ],
  },
];

export const DOG_BREEDS: DogBreedOption[] = DOG_BREED_GROUPS.flatMap((group) =>
  group.breeds.map((breed) => ({ ...breed, groupId: group.id, groupName: group.name })),
);

export const MIX_BREED_OPTION: DogBreedOption = {
  name: MIX_BREED_NAME,
  englishName: "Mix",
  aliases: ["믹스", "기타", "잡종"],
  groupId: 0,
  groupName: "기타",
};

export const DOG_BREED_OPTIONS: DogBreedOption[] = [...DOG_BREEDS, MIX_BREED_OPTION];
