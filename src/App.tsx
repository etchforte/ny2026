import { useState, useRef, useEffect } from 'react'

/* ═══════════════════════════════════════ TYPES ══════════════════════════════════════ */
interface TravelLink {
  name: string
  url: string
  type: 'map' | 'web' | 'pdf' | 'img'
}

interface TravelItem {
  id: number
  date: string
  day: string
  time?: string
  task?: string
  ref?: string
  isHtmlRef?: boolean
  links?: TravelLink[]
}

type SegLine = 'airtrain' | 'walk' | 'subway-e' | 'subway-f' | 'bus-q70'

interface RouteStation {
  kind: 'station'
  name: string
  isOrigin?: boolean
  isDestination?: boolean
}

interface RouteSegment {
  kind: 'segment'
  line: SegLine
  badge: string
  direction?: string
  details?: string
}

type RouteNode = RouteStation | RouteSegment

/* ════════════════════════════════════ TRANSIT DATA ══════════════════════════════════ */
const LINE_COLORS: Record<SegLine, string> = {
  airtrain: '#E3132C',
  walk: '#555555',
  'subway-e': '#0039A6',
  'subway-f': '#FF6319',
  'bus-q70': '#00A1DE',
}

const ROUTES: Record<number, RouteNode[]> = {
  21: [
    { kind: 'station', name: 'Terminal 8 (JFK 공항 터미널)', isOrigin: true },
    { kind: 'segment', line: 'airtrain', badge: 'AirTrain', direction: 'Jamaica Station 행', details: '이동: 8분 · 정류장 2개' },
    { kind: 'station', name: 'Jamaica Station' },
    { kind: 'segment', line: 'walk', badge: '도보', details: '지하철 환승 연결 통로 이용' },
    { kind: 'station', name: 'Sutphin Blvd–Archer Av' },
    { kind: 'segment', line: 'subway-e', badge: 'E', direction: 'World Trade Center 방향', details: '이동: 34분 · 역 12개' },
    { kind: 'station', name: '42 St–Bryant Pk (숙소 도착)', isDestination: true },
  ],
  99: [
    { kind: 'station', name: '레지던스 인 타임스퀘어 (출발)', isOrigin: true },
    { kind: 'segment', line: 'walk', badge: '도보', details: '42 St–Bryant Pk 역 진입' },
    { kind: 'station', name: '42 St–Bryant Pk 역' },
    { kind: 'segment', line: 'subway-f', badge: 'F', direction: 'Jamaica–179 St 방향 탑승', details: '역 10개 이동' },
    { kind: 'station', name: 'Jackson Hts–Roosevelt Av 역 (환승)' },
    { kind: 'segment', line: 'walk', badge: '도보', details: 'LaGuardia Airport / Q70 SBS 안내판 따라' },
    { kind: 'station', name: 'Jackson Hts–Roosevelt Av (지상 정류장)' },
    { kind: 'segment', line: 'bus-q70', badge: 'Q70-SBS', direction: 'LaGuardia Link 급행버스 (무료)', details: '약 15~20분 소요' },
    { kind: 'station', name: '라과디아 공항(LGA) 터미널 C 도착', isDestination: true },
  ],
}

/* ═══════════════════════════════════ TRAVEL DATA ════════════════════════════════════ */
const travelData: TravelItem[] = [
  /* ── Oct 21 수 ── */
  {
    id: 1, date: "2026. 10. 21", day: "수", time: "10:00", task: "인천 출발 (KE081)",
    ref: "터미널 2 / 가족별 항공권 확인",
    links: [
      { name: "임세호 e-Ticket", url: "/sources/de_sh.pdf", type: "pdf" },
      { name: "방수진 e-Ticket", url: "/sources/de_sj.pdf", type: "pdf" },
      { name: "임지우 e-Ticket", url: "/sources/de_ju.pdf", type: "pdf" },
    ],
  },
  { id: 2, date: "2026. 10. 21", day: "수", time: "11:00", task: "뉴욕 JFK 도착", ref: "터미널 1" },
  {
    id: 21, date: "2026. 10. 21", day: "수", task: "공항에서 숙소 이동", isHtmlRef: true,
    links: [{ name: "구글맵 실시간 경로 보기", url: "https://maps.app.goo.gl/dRLTHqLLL4R5L2Kf6", type: "map" }],
  },
  {
    id: 22, date: "2026. 10. 21", day: "수", task: "레지던스 인 바이 메리어트 뉴욕 맨해튼/타임스퀘어 숙박",
    ref: "예약번호 : 72152005\n객실 세부 정보 : 킹 스튜디오 스위트, 스튜디오, 1킹베드, 소파침대",
    links: [{ name: "숙소 위치 보기", url: "https://maps.google.com/?q=Residence+Inn+by+Marriott+New+York+Manhattan/Times+Square", type: "map" }],
  },
  {
    id: 23, date: "2026. 10. 21", day: "수", task: "장보기 (추천 마트 3곳)",
    ref: "🛒 숙소 주변 추천 식료품점 리스트\n\n1. 타겟 (Target 타임스퀘어점)\n- 도보 3~4분 (가장 가까움)\n- 대용량 생수, 우유, 시리얼, 생필품 조달 용이\n\n2. H 마트 (H Mart 코리아타운점)\n- 도보 7~8분\n- 햇반, 컵라면, 한식 반찬 및 과일 구매 최적\n\n3. 트레이더 조 (Trader Joe's 첼시점)\n- 대중교통 10~15분\n- 현지 유기농 제품, 인기 스낵, 주스, 가성비 최고",
    links: [
      { name: "타겟 위치 보기", url: "https://maps.google.com/?q=Target+237+W+42nd+St+New+York", type: "map" },
      { name: "H 마트 위치 보기", url: "https://maps.google.com/?q=H+Mart+38+W+32nd+St+New+York", type: "map" },
      { name: "트레이더 조 위치 보기", url: "https://maps.google.com/?q=Trader+Joe's+675+6th+Ave+New+York", type: "map" },
    ],
  },
  /* ── Oct 22 목 ── */
  {
    id: 31, date: "2026. 10. 22", day: "목", task: "첼시마켓 (Chelsea Market)",
    ref: "과거 나비스코 과자 공장을 개조한 실내 마켓입니다. 랍스터 플레이스, 사라베스 베이커리 등 유명한 맛집과 아기자기한 소품샵이 많아 구경하기 좋습니다.",
    links: [{ name: "위치 보기", url: "https://maps.google.com/?q=Chelsea+Market", type: "map" }],
  },
  {
    id: 32, date: "2026. 10. 22", day: "목", task: "더 하이라인 (The High Line)",
    ref: "버려진 고가 철길을 아름다운 공원으로 재탄생시킨 뉴욕의 상징적인 산책로입니다. 도심 빌딩 숲 사이를 꽃과 나무와 함께 걸으며 뉴욕의 정취를 느끼기 좋습니다.",
    links: [{ name: "위치 보기", url: "https://maps.google.com/?q=The+High+Line", type: "map" }],
  },
  {
    id: 33, date: "2026. 10. 22", day: "목", task: "베슬 (The Vessel)",
    ref: "허드슨 야드 중심에 위치한 거대한 벌집 모양의 건축물입니다. 독특한 기하학적 구조로 사진 찍기 가장 좋은 스팟 중 하나입니다. (현재 내부는 폐쇄되었으나 외부 관람 및 주변 산책 가능)",
    links: [{ name: "위치 보기", url: "https://maps.google.com/?q=The+Vessel", type: "map" }],
  },
  {
    id: 3, date: "2026. 10. 22", day: "목", time: "17:00", task: "엣지 전망대",
    ref: "입장 시 PDF 티켓 제시",
    links: [
      { name: "엣지 티켓(PDF)", url: "/sources/edge.pdf", type: "pdf" },
      { name: "위치 보기", url: "https://maps.app.goo.gl/8ec5cptZvhSBtyJk7", type: "map" },
    ],
  },
  /* ── Oct 23 금 ── */
  {
    id: 41, date: "2026. 10. 23", day: "금", task: "브루클린 브릿지 도보 횡단 (오전)",
    ref: "맨해튼 진입로에서 브루클린 방향으로 다리를 건너는 코스입니다. 정면과 우측으로 펼쳐지는 탁 트인 고층 빌딩과 자유의 여신상 뷰를 감상하며 사진을 찍기 좋습니다. (도보 약 45분~1시간 소요)",
    links: [{ name: "맨해튼 진입로 위치(뉴욕시청)", url: "https://maps.app.goo.gl/WUpYqzCsZcse6YZ47", type: "map" }],
  },
  {
    id: 42, date: "2026. 10. 23", day: "금", task: "덤보(DUMBO) 점심 식사",
    ref: "🍕 덤보 맛집 추천\n\n1. 줄리아나스 피자 (Juliana's)\n- 정통 화덕 피자 명가 (그리말디보다 대기 환경이 쾌적)\n\n2. 타임아웃 마켓 (Time Out Market)\n- 다양한 현지 유명 푸드 부스가 모여 있어 아이와 다채로운 메뉴를 고르기 좋음",
    links: [
      { name: "줄리아나스 피자", url: "https://maps.app.goo.gl/vg2tNocAPrzRqszv9", type: "map" },
      { name: "타임아웃 마켓 뉴욕", url: "https://maps.app.goo.gl/9TVX5juDHw6TP4Gs7", type: "map" },
    ],
  },
  {
    id: 431, date: "2026. 10. 23", day: "금", task: "덤보 포토 스팟 (DUMBO Photo Spot)",
    ref: "📸 뉴욕 최고의 사진 명소\n\n붉은 벽돌 건물 사이로 맨해튼 브릿지가 일직선으로 보이는 스팟입니다. 다리 교각 아래로 엠파이어 스테이트 빌딩이 완벽하게 겹쳐 보이는 위치(Water St & Washington St)를 찾아 멋진 스냅사진을 남겨보세요.",
    links: [{ name: "포토존 위치 보기", url: "https://maps.app.goo.gl/28DgEMzDN47iGqHk8", type: "map" }],
  },
  {
    id: 432, date: "2026. 10. 23", day: "금", task: "브루클린 브릿지 파크 산책",
    ref: "🌿 강변 수변 공원 휴식\n\n맨해튼 마천루의 스카이라인을 강 건너편에서 가장 온전하고 넓게 감상할 수 있는 공원입니다. 탁 트인 잔디밭과 산책로를 따라 여유롭게 걸으며 뉴욕 도심의 풍경을 한눈에 담기 좋습니다.",
    links: [{ name: "공원 위치 보기", url: "https://maps.app.goo.gl/mZykP9psPDekP9ox9", type: "map" }],
  },
  {
    id: 433, date: "2026. 10. 23", day: "금", task: "제인의 회전목마 (Jane's Carousel)",
    ref: "🎠 아이 동반 필수 코스\n\n이스트 강변의 투명한 유리 사각형 빌딩 안에 보호되어 있는 클래식하고 아름다운 회전목마입니다. 1922년에 제작된 빈티지 목마를 아이와 함께 타고 돌며 특별한 추억을 만들어보세요.",
    links: [{ name: "회전목마 위치 보기", url: "https://maps.app.goo.gl/ZaixCj8qyfkToh167", type: "map" }],
  },
  {
    id: 434, date: "2026. 10. 23", day: "금", task: "1호텔 브루클린 브릿지 루프탑 바",
    ref: "🍸 Harriet's Rooftop 휴식\n\n낮이나 일몰 무렵, 맨해튼 스카이라인과 브루클린 브릿지를 아무런 막힘없이 파노라마 뷰로 감상할 수 있는 친환경 디자인 컨셉의 루프탑 바입니다. 시원한 오픈에어 테라스에서 시그니처 칵테일이나 주스를 마시며 여행의 피로를 풀어보세요.",
    links: [{ name: "루프탑 바 위치 보기", url: "https://maps.app.goo.gl/tWKEB3hKR5go2rqG8", type: "map" }],
  },
  /* ── Oct 24 토 ── */
  {
    id: 51, date: "2026. 10. 24", day: "토", task: "페더럴 홀 (Federal Hall National Memorial)",
    ref: "미국 초대 대통령 조지 워싱턴의 취임식이 거행되었던 유서 깊은 역사적 랜드마크입니다. 그리스 신전 모양의 고전적인 건축 양식과 정문 앞 거대한 워싱턴 동상이 인상적인 무료 관람 명소입니다.",
    links: [{ name: "위치 보기", url: "https://maps.app.goo.gl/2RYdUYojYQTzuUzC6", type: "map" }],
  },
  {
    id: 52, date: "2026. 10. 24", day: "토", task: "트리니티 교회 (Trinity Church)",
    ref: "페더럴 홀 바로 옆, 빌딩 숲 한가운데 자리 잡은 고딕 양식의 수려한 교회입니다. 미국 건국의 아버지 중 한 명인 알렉산더 해밀턴의 무덤이 있으며, 조용하게 내부를 둘러보기 좋습니다.",
    links: [{ name: "위치 보기", url: "https://maps.app.goo.gl/xYp8boFriXJwbez5A", type: "map" }],
  },
  {
    id: 53, date: "2026. 10. 24", day: "토", task: "돌진하는 황소 (Charging Bull)",
    ref: "뉴욕 금융지구의 강력한 상징물로, 황소 동상을 만지면 부자가 된다는 속설이 있어 전 세계 관광객들이 줄을 서는 인증샷 명소입니다. 맞은편 '두려움 없는 소녀상'도 함께 만날 수 있습니다.",
    links: [{ name: "위치 보기", url: "https://maps.app.goo.gl/wSN6VZAXhPrqwDCPA", type: "map" }],
  },
  {
    id: 54, date: "2026. 10. 24", day: "토", task: "오큘러스 & 9/11 메모리얼 파크",
    ref: "하얀 새가 날개를 편 듯한 압도적 외관의 세계적 건축물 '오큘러스 쇼핑몰'과, 바로 옆에 위치한 아픈 역사를 아름다운 분수로 승화시킨 '9/11 메모리얼 파크'입니다. 쾌적한 실내 공간과 푸드코트가 있어 아이와 들르기 좋습니다.",
    links: [{ name: "위치 보기", url: "https://maps.app.goo.gl/UjcLzkh6o9kSLmqcA", type: "map" }],
  },
  {
    id: 5, date: "2026. 10. 24", day: "토", time: "17:00", task: "자유의 여신상 크루즈",
    ref: "선착장 확인 및 티켓 지참",
    links: [
      { name: "임세호&방수진 티켓", url: "/sources/cruise1.pdf", type: "pdf" },
      { name: "임지우 티켓", url: "/sources/cruise2.pdf", type: "pdf" },
      { name: "선착장 위치", url: "https://maps.app.goo.gl/HzJzeTpJ8Dpffh3N9", type: "map" },
      { name: "공식 홈페이지", url: "https://www.circleline.com/sightseeing-cruises/statue-of-liberty/downtown-statue-at-sunset", type: "web" },
    ],
  },
  /* ── Oct 25 일 ── */
  {
    id: 601, date: "2026. 10. 25", day: "일", task: "할로윈 어드벤처 숍 (Halloween Adventure)",
    ref: "🎃 유니언 스퀘어 인근 시즌 핫스팟\n\n10월 말 뉴욕 분위기를 온몸으로 느낄 수 있는 초대형 할로윈 코스튬 전문 매장입니다. 기발한 소품과 의상이 가득해 아이와 함께 구경하며 재미있는 추억을 남기기 좋습니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=Halloween+Adventure+New+York", type: "map" }],
  },
  {
    id: 602, date: "2026. 10. 25", day: "일", task: "쥬미즈 (Zumiez)",
    ref: "🛹 스트리트 & 스케이트 보드 편집숍\n\n다양한 브랜드의 스케이트 보드 장비, 캐주얼 의류, 스니커즈를 한곳에서 만나볼 수 있는 활기찬 매장입니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=Zumiez+Broadway+NY", type: "map" }],
  },
  {
    id: 603, date: "2026. 10. 25", day: "일", task: "르뱅 베이커리 (Levain Bakery NoHo)",
    ref: "🍪 뉴욕의 시그니처 디저트 타임\n\n겉은 바삭하고 속은 촉촉한 두툼한 쿠키로 전 세계적인 사랑을 받는 디저트 맛집입니다. 도보 쇼핑 중 달콤하게 당을 충전하기에 가장 좋은 코스입니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=Levain+Bakery+NoHo", type: "map" }],
  },
  {
    id: 604, date: "2026. 10. 25", day: "일", task: "아이스크림 박물관 (Museum of Ice Cream)",
    ref: "🍦 달콤하고 팝한 핑크빛 체험 전시\n\n아이뿐만 아니라 온 가족이 시각과 미각으로 즐길 수 있는 이색 인터랙티브 박물관입니다. 공간마다 제공되는 아이스크림을 맛보고 화려한 인스타그래머블 스팟에서 독특한 가족사진을 남겨보세요.",
    links: [{ name: "박물관 위치 보기", url: "https://maps.google.com/?q=Museum+of+Ice+Cream+New+York", type: "map" }],
  },
  {
    id: 605, date: "2026. 10. 25", day: "일", task: "키스 맨해튼 (KITH Manhattan)",
    ref: "👟 뉴욕 스니커즈 & 스트리트 패션의 성지\n\n단순한 편집숍을 넘어 감각적인 인테리어와 한정판 컬렉션으로 뉴욕 패션 트렌드를 선도하는 KITH의 메인 플래그십 스토어입니다. 매장 내의 'Kith Treats' 시그니처 아이스크림 바도 놓치지 마세요.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=KITH+Manhattan", type: "map" }],
  },
  {
    id: 606, date: "2026. 10. 25", day: "일", task: "키스 우먼 (KITH Women)",
    ref: "🛍️ 여성 컬렉션 특화 플래그십\n\n남성 매장 인근에 별도로 독립된 공간으로, 미니멀하면서도 고급스러운 특유의 감성으로 채워진 여성 라인 전문 스토어입니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=KITH+Women+New+York", type: "map" }],
  },
  {
    id: 607, date: "2026. 10. 25", day: "일", task: "스투시 소호 (Stüssy New York Chapter)",
    ref: "🛹 글로벌 스트리트 웨어의 정석\n\n소호 중심가에 위치한 스투시 챕터 매장입니다. 뉴욕 익스클루시브 아이템이나 클래식한 그래픽 티셔츠 등 소장 가치 높은 기본 아이템들을 둘러보기 좋습니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.google.com/?q=Stussy+New+York", type: "map" }],
  },
  {
    id: 608, date: "2026. 10. 25", day: "일", task: "슈프림 (Supreme New York)",
    ref: "🔥 뉴욕 스케이트 문화의 상징\n\n로어 맨해튼 쇼핑의 하이라이트를 장식할 슈프림 플래그십 스토어입니다. 매장 내 거대한 스케이트 볼 파크 인테리어가 압도적인 스케일을 자랑하며, 독보적인 스트리트 브랜드 감성을 로컬에서 온전히 경험할 수 있습니다.",
    links: [{ name: "매장 위치 보기", url: "https://maps.app.goo.gl/d671Y72UDNTJhWEe8", type: "map" }],
  },
  /* ── Oct 26 월 ── */
  {
    id: 71, date: "2026. 10. 26", day: "월", task: "센트럴 파크 가을 산책 & 뷰포인트 촬영",
    ref: "가을 풍경이 가장 아름다운 3대 스냅 명소 코스\n\n1. 더 몰 (The Mall): 영화에 단골로 나오는 거대한 느티나무 가로수길 (가족사진 최적)\n2. 베데스다 테라스 & 분수: 아치형 회랑 내부와 분수대를 배경으로 입체적인 연출 가능\n3. 보우 브릿지 (Bow Bridge): 호수와 건너편 빌딩 숲이 어우러지는 가장 로맨틱한 다리",
    links: [
      { name: "더 몰 위치", url: "https://maps.app.goo.gl/TWmDZPy9xtEBCTUo9", type: "map" },
      { name: "베데스다 분수 위치", url: "https://maps.app.goo.gl/mfA1z3fVKgzQLDT46", type: "map" },
      { name: "보우 브릿지 위치", url: "https://maps.app.goo.gl/MF1xwpJFt4i1ky1aA", type: "map" },
    ],
  },
  {
    id: 72, date: "2026. 10. 26", day: "월", task: "구겐하임 미술관 (Solomon R. Guggenheim Museum)",
    ref: "프랭크 로이드 라이트가 설계한 달팽이 모양의 독특한 나선형 외관이 특징인 현대미술의 대명사입니다. 센트럴 파크 동쪽(Upper East Side) 도로변에 바로 인접해 있습니다.",
    links: [{ name: "위치 보기", url: "https://maps.app.goo.gl/pZyDpjzPLUT3hEJn96", type: "map" }],
  },
  {
    id: 7, date: "2026. 10. 26", day: "월", task: "메트로폴리탄 미술관 (The Met)",
    ref: "이 날 하루 중 편하신 시간에 자유롭게 입장하여 관람이 가능합니다.",
    links: [
      { name: "미술관 티켓(PDF)", url: "/sources/met.pdf", type: "pdf" },
      { name: "위치 보기", url: "https://maps.app.goo.gl/pZyDpjzPLUT3hEJn9", type: "map" },
    ],
  },
  /* ── Oct 27 화 ── */
  {
    id: 801, date: "2026. 10. 27", day: "화", time: "11:00", task: "MoMA (뉴욕 현대미술관)",
    ref: "🎨 현대카드 플래티넘 이상 회원 본인 및 동반 2인 무료 입장 혜택 가능!\n\n※ 입장 방법: 미술관 로비의 안내 데스크(Information Desk)에 실물 현대카드와 본인 신분증(여권)을 제시하면 무료 입장권 발권이 가능합니다. 현지 규정이 변경될 수 있으니 사전에 상세 조건을 링크를 통해 확인해 주세요.",
    links: [
      { name: "현대카드 MoMA 혜택 안내", url: "https://www.hyundaicard.com/cpl/cu/CPLCU0403_01.hc", type: "web" },
      { name: "미술관 위치 보기", url: "https://maps.app.goo.gl/g2865FdxKwqwXHVW8", type: "map" },
    ],
  },
  {
    id: 8, date: "2026. 10. 27", day: "화", time: "18:00", task: "서밋 전망대",
    ref: "누르면 티켓 이미지가 크게 뜹니다.",
    links: [
      { name: "서밋 티켓 1(JPG)", url: "/sources/summit1.jpg", type: "img" },
      { name: "서밋 티켓 2(JPG)", url: "/sources/summit2.jpg", type: "img" },
      { name: "위치 보기", url: "https://maps.app.goo.gl/zgBeo4VBY4R6rupM8", type: "map" },
    ],
  },
  /* ── Oct 28 수 ── */
  {
    id: 9, date: "2026. 10. 28", day: "수", time: "19:00", task: "빅버스 나이트 투어",
    ref: "오후 6:30 까지 Stop #1 (M&Ms World @ 7th Ave. and West 48th St)에서 대기",
    links: [
      { name: "티켓 1", url: "/sources/bigbus1.jpg", type: "img" },
      { name: "티켓 2", url: "/sources/bigbus2.jpg", type: "img" },
      { name: "티켓 3", url: "/sources/bigbus3.jpg", type: "img" },
      { name: "승차장 위치", url: "https://maps.app.goo.gl/uDyZo1gvzhVTVZSe8", type: "map" },
      { name: "홈페이지", url: "https://www.bigbustours.com/en/new-york/new-york-night-tour-ticket", type: "web" },
    ],
  },
  /* ── Oct 29 목 ── */
  { id: 99, date: "2026. 10. 29", day: "목", time: "10:45", task: "숙소에서 공항 이동", isHtmlRef: true },
  { id: 10, date: "2026. 10. 29", day: "목", time: "14:55", task: "뉴욕 출발 (LGA)", ref: "항공편: DELTA 5709 / 예약번호: GNC8HQ / 추가 수하물 구입해야함" },
  { id: 11, date: "2026. 10. 29", day: "목", time: "16:24", task: "워싱턴 DCA 도착" },
  /* ── 워싱턴 일정 미정 ── */
  { id: 12, date: "2026. 10. 30", day: "금" },
  { id: 13, date: "2026. 10. 31", day: "토" },
  { id: 14, date: "2026. 11. 1", day: "일" },
  { id: 15, date: "2026. 11. 2", day: "월" },
  { id: 16, date: "2026. 11. 3", day: "화" },
  { id: 17, date: "2026. 11. 4", day: "수" },
  { id: 18, date: "2026. 11. 5", day: "목" },
  /* ── Nov 6 금 ── */
  {
    id: 19, date: "2026. 11. 6", day: "금", time: "11:50", task: "워싱턴 IAD 출발 (KE094)",
    ref: "가족별 항공권 확인 (귀국편)",
    links: [
      { name: "임세호 e-Ticket", url: "/sources/de_sh.pdf", type: "pdf" },
      { name: "방수진 e-Ticket", url: "/sources/de_sj.pdf", type: "pdf" },
      { name: "임지우 e-Ticket", url: "/sources/de_ju.pdf", type: "pdf" },
    ],
  },
  /* ── Nov 7 토 ── */
  { id: 20, date: "2026. 11. 7", day: "토", time: "17:40", task: "인천 도착", ref: "고생하셨습니다! 🎉" },
]

/* ═══════════════════════════════════════ HELPERS ════════════════════════════════════ */
const uniqueDates = [...new Set(travelData.map(d => d.date))]

function getTodayStr() {
  const n = new Date()
  return `${n.getFullYear()}. ${n.getMonth() + 1}. ${n.getDate()}`
}

function shortDate(date: string) {
  const p = date.split('. ')
  return `${parseInt(p[1])}.${p[2]}`
}

function getIcon(task?: string): string {
  if (!task) return '📍'
  if (task.includes('출발') && (task.includes('인천') || task.includes('IAD') || task.includes('LGA'))) return '✈️'
  if (task.includes('도착') && task.includes('인천')) return '✈️'
  if (task.includes('JFK') || task.includes('DCA')) return '✈️'
  if (task.includes('공항에서') || task.includes('숙소에서 공항')) return '🚇'
  if (task.includes('숙박') || task.includes('레지던스')) return '🏨'
  if (task.includes('장보기') || task.includes('마트')) return '🛒'
  if (task.includes('미술관') || task.includes('박물관') || task.includes('MoMA') || task.includes('Met') || task.includes('구겐하임')) return '🎨'
  if (task.includes('파크') || task.includes('하이라인') || task.includes('산책')) return '🌿'
  if (task.includes('식사') || task.includes('베이커리') || task.includes('맛집') || task.includes('피자')) return '🍽️'
  if (task.includes('KITH') || task.includes('키스') || task.includes('슈프림') || task.includes('스투시') || task.includes('쥬미즈')) return '🛍️'
  if (task.includes('전망대') || task.includes('엣지') || task.includes('서밋')) return '👁️'
  if (task.includes('크루즈') || task.includes('여신상')) return '🛳️'
  if (task.includes('브릿지') && !task.includes('파크')) return '🌉'
  if (task.includes('투어')) return '🚌'
  if (task.includes('할로윈')) return '🎃'
  if (task.includes('회전목마')) return '🎠'
  if (task.includes('루프탑')) return '🍸'
  if (task.includes('아이스크림')) return '🍦'
  if (task.includes('포토') || task.includes('사진')) return '📸'
  if (task.includes('황소') || task.includes('오큘러스') || task.includes('페더럴') || task.includes('트리니티') || task.includes('베슬')) return '🏛️'
  if (task.includes('첼시') || task.includes('어드벤처')) return '🏪'
  return '📍'
}

/* ══════════════════════════════════ ROUTE MAP COMPONENT ══════════════════════════════ */
function RouteMap({ nodes }: { nodes: RouteNode[] }) {
  return (
    <div style={{ paddingLeft: 4, marginTop: 8 }}>
      {nodes.map((node, i) => {
        if (node.kind === 'station') {
          const hl = node.isOrigin || node.isDestination
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: hl ? '#F7B733' : 'transparent',
                border: `3px solid ${hl ? '#F7B733' : 'rgba(255,255,255,0.3)'}`,
                zIndex: 2,
              }} />
              <span style={{
                color: hl ? '#F7B733' : 'rgba(255,255,255,0.85)',
                fontWeight: hl ? 700 : 500,
                fontSize: 14, lineHeight: 1.35,
              }}>{node.name}</span>
            </div>
          )
        } else {
          const color = LINE_COLORS[node.line]
          const isDash = node.line === 'walk'
          const isCircle = node.line === 'subway-e' || node.line === 'subway-f'
          return (
            <div key={i} style={{
              marginLeft: 5,
              paddingLeft: 20,
              paddingTop: 9,
              paddingBottom: 12,
              borderLeft: isDash ? `3px dashed ${color}` : `3px solid ${color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {isCircle && (
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: color, color: '#fff',
                    fontSize: 11, fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{node.badge}</span>
                )}
                {!isCircle && !isDash && (
                  <span style={{
                    background: color, color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                  }}>{node.badge}</span>
                )}
                {isDash && (
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600 }}>
                    {node.badge}
                  </span>
                )}
                {node.direction && (
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 }}>
                    {node.direction}
                  </span>
                )}
              </div>
              {node.details && (
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 4 }}>
                  {node.details}
                </div>
              )}
            </div>
          )
        }
      })}
    </div>
  )
}

/* ════════════════════════════════════ MODAL COMPONENT ═══════════════════════════════ */
function Modal({ item, onClose }: { item: TravelItem; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const routes = ROUTES[item.id]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  function linkBg(type: string) {
    if (type === 'map') return { background: '#162e20', color: '#6ee7a0' }
    if (type === 'web') return { background: '#F7B733', color: '#000' }
    if (type === 'img') return { background: '#162040', color: '#93c5fd' }
    return { background: 'rgba(255,255,255,0.08)', color: '#f0f0f0' }
  }

  function linkIcon(type: string) {
    if (type === 'map') return '📍'
    if (type === 'web') return '🌐'
    if (type === 'img') return '🖼️'
    return '📄'
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="modal-card scroll-hide"
        style={{
          background: '#1c1c1e',
          width: '100%', maxWidth: 500,
          borderRadius: '24px 24px 0 0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* NYC yellow top accent */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #F7B733, #ffcf5c)', flexShrink: 0 }} />

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Title */}
        <div style={{ padding: '10px 22px 0', flexShrink: 0 }}>
          <div style={{ color: '#F7B733', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {item.date} ({item.day}) {item.time && `· ${item.time}`}
          </div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 19, lineHeight: 1.35, margin: 0 }}>
            {getIcon(item.task)} {item.task}
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 8px' }}>
          {item.isHtmlRef && routes ? (
            <RouteMap nodes={routes} />
          ) : item.ref && item.ref.trim() ? (
            <p style={{
              color: 'rgba(255,255,255,0.62)', fontSize: 14,
              lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0,
            }}>
              {item.ref}
            </p>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, margin: 0 }}>
              상세 정보가 없습니다.
            </p>
          )}

          {item.links && item.links.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', borderRadius: 13,
                    fontWeight: 600, fontSize: 14,
                    textDecoration: 'none',
                    ...linkBg(link.type),
                  }}
                >
                  <span style={{ fontSize: 16 }}>{linkIcon(link.type)}</span>
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div style={{
          padding: '12px 22px 28px',
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '14px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, color: '#fff',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════ APP ════════════════════════════════════════ */
export default function App() {
  const today = getTodayStr()
  const initDate = uniqueDates.includes(today) ? today : uniqueDates[0]
  const [selectedDate, setSelectedDate] = useState(initDate)
  const [modal, setModal] = useState<TravelItem | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const dayIndex = uniqueDates.indexOf(selectedDate)
  const dayItems = travelData.filter(d => d.date === selectedDate)
  const scheduleItems = dayItems.filter(d => !!d.task)
  const dayLabel = dayItems[0]?.day ?? ''

  function selectDate(date: string) {
    setSelectedDate(date)
    setTimeout(() => {
      const el = navRef.current?.querySelector(`[data-date="${date}"]`) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, 50)
  }

  function selectToday() {
    const t = getTodayStr()
    selectDate(uniqueDates.includes(t) ? t : uniqueDates[0])
  }

  function isClickable(item: TravelItem) {
    return !!(item.ref?.trim() || (item.isHtmlRef && ROUTES[item.id]) || (item.links && item.links.length > 0))
  }

  return (
    <div style={{ minHeight: '100%', background: '#0d0d0d', color: '#fff' }}>

      {/* ── Hero ── */}
      <header style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1769628921124-1a2fd1730863?w=900&h=340&fit=crop&auto=format"
          alt="New York City Brooklyn Bridge skyline at night"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.22,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(13,13,13,0.9) 70%, #0d0d0d 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '36px 20px 28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(247,183,51,0.12)', border: '1px solid rgba(247,183,51,0.25)',
            borderRadius: 999, padding: '4px 12px',
            color: '#F7B733', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            ✈ Oct 21 – Nov 7, 2026 · New York & Washington
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 52,
            lineHeight: 0.95, letterSpacing: '-0.01em',
            color: '#fff', margin: '0 0 12px',
          }}>
            지우네 가족 미국여행🗽
          </h1>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ label: '출발', val: '10.21' }, { label: '귀국', val: '11.7' }, { label: '총', val: '18일' }].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</span>
                <span style={{ color: '#F7B733', fontWeight: 700, fontSize: 15 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Day Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(13,13,13,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div
          ref={navRef}
          className="scroll-hide"
          style={{ display: 'flex', gap: 6, padding: '10px 14px', overflowX: 'auto' }}
        >
          <button
            onClick={selectToday}
            style={{
              flexShrink: 0, padding: '7px 13px', borderRadius: 999,
              background: '#E3132C', color: '#fff', border: 'none',
              fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.04em',
            }}
          >
            TODAY
          </button>

          {uniqueDates.map((date, i) => {
            const active = date === selectedDate
            return (
              <button
                key={date}
                data-date={date}
                onClick={() => selectDate(date)}
                style={{
                  flexShrink: 0, padding: '6px 10px', borderRadius: 999,
                  background: active ? '#F7B733' : 'rgba(255,255,255,0.07)',
                  color: active ? '#0d0d0d' : 'rgba(255,255,255,0.5)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, lineHeight: 1 }}>{i + 1}일</span>
                <span style={{ fontSize: 9, fontWeight: 400, opacity: active ? 0.6 : 0.55, lineHeight: 1 }}>{shortDate(date)}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Schedule ── */}
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '24px 14px 56px' }}>

        {/* Day header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 20 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 80, lineHeight: 0.85,
            color: '#F7B733', letterSpacing: '-0.02em',
          }}>{dayIndex + 1}</span>
          <div style={{ paddingBottom: 6 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, lineHeight: 1 }}>일차</div>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, marginTop: 5 }}>
              {selectedDate} ({dayLabel})
            </div>
          </div>
        </div>

        {/* Items */}
        {scheduleItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {scheduleItems.map(item => {
              const clickable = isClickable(item)
              return (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  clickable={clickable}
                  onClick={() => clickable && setModal(item)}
                />
              )
            })}
          </div>
        ) : (
          <div style={{
            background: '#181818',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
            padding: '48px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 14, margin: 0, fontWeight: 500 }}>
              일정이 아직 미정입니다
            </p>
          </div>
        )}
      </main>

      {modal && <Modal item={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

/* ── Schedule Card sub-component ── */
function ScheduleCard({
  item,
  clickable,
  onClick,
}: {
  item: TravelItem
  clickable: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && clickable ? '#222' : '#191919',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
        display: 'flex',
        transition: 'background 0.15s, transform 0.1s',
        transform: hovered && clickable ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Left accent strip */}
      <div style={{
        width: 3, flexShrink: 0, alignSelf: 'stretch',
        background: item.time ? '#F7B733' : 'rgba(255,255,255,0.08)',
      }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '13px 14px' }}>
        {item.time && (
          <div style={{
            color: '#F7B733', fontSize: 10, fontWeight: 700,
            fontFamily: "'Barlow Condensed', monospace",
            letterSpacing: '0.06em', marginBottom: 5,
          }}>
            {item.time}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
          <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.35 }}>{getIcon(item.task)}</span>
          <span style={{
            color: 'rgba(255,255,255,0.87)', fontSize: 14,
            fontWeight: 500, lineHeight: 1.45,
          }}>
            {item.task}
          </span>
        </div>
      </div>

      {/* Chevron */}
      {clickable && (
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 3L9 7L5 11"
              stroke={hovered ? 'rgba(247,183,51,0.6)' : 'rgba(255,255,255,0.2)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
