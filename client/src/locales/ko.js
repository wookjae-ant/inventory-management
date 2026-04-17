export default {
  // Navigation
  nav: {
    overview: "개요",
    inventory: "재고",
    orders: "주문",
    restocking: "재입고",
    finance: "재무",
    demandForecast: "수요 예측",
    reports: "보고서",
    companyName: "카탈리스트 컴포넌츠",
    subtitle: "재고 관리 시스템",
  },

  // Dashboard
  dashboard: {
    title: "개요",
    kpi: {
      title: "핵심 성과 지표",
      inventoryTurnover: "재고 회전율",
      ordersFulfilled: "주문 처리 건수",
      orderFillRate: "주문 충족률",
      revenue: "매출 (주문)",
      revenueYTD: "매출 (주문) 연간 누계",
      revenueMTD: "매출 (주문) 월간 누계",
      avgProcessingTime: "평균 처리 시간 (일)",
      goal: "목표",
    },
    summary: {
      title: "요약",
    },
    orderHealth: {
      title: "주문 현황",
      totalOrders: "총 주문 수",
      revenue: "매출",
      avgOrderValue: "평균 주문 금액",
      onTimeRate: "정시 납기율",
      avgFulfillmentDays: "평균 처리 일수",
      total: "합계",
    },
    ordersByMonth: {
      title: "월별 주문 수",
    },
    inventoryValue: {
      title: "카테고리별 재고 가치",
    },
    inventoryShortages: {
      title: "재고 부족",
      noShortages: "재고 부족 없음 - 모든 주문을 처리할 수 있습니다!",
      noData: "선택한 필터에 해당하는 데이터가 없습니다",
      orderId: "주문 ID",
      sku: "SKU",
      itemName: "품목명",
      quantityNeeded: "필요 수량",
      quantityAvailable: "재고 수량",
      shortage: "부족량",
      daysDelayed: "지연 일수",
      priority: "우선순위",
      unitsShort: "단위 부족",
      days: "일",
    },
    topProducts: {
      title: "매출 상위 제품",
      sku: "SKU",
      product: "제품",
      category: "카테고리",
      warehouse: "창고",
      stockStatus: "재고 상태",
      revenue: "매출",
      unitsOrdered: "주문 수량",
      firstOrder: "최초 주문일",
      inStock: "재고 있음",
      lowStock: "재고 부족",
    },
  },

  // Inventory
  inventory: {
    title: "재고",
    description: "모든 재고 품목 추적 및 관리",
    stockLevels: "재고 수준",
    skus: "SKU",
    searchPlaceholder: "품목명으로 검색...",
    clearSearch: "검색 초기화",
    exportCsv: "CSV 내보내기",
    exportCsvDisabled: "내보낼 데이터가 없습니다",
    totalItems: "총 품목 수",
    totalValue: "총 가치",
    lowStockItems: "재고 부족 품목",
    warehouses: "창고",
    table: {
      sku: "SKU",
      itemName: "품목명",
      name: "이름",
      category: "카테고리",
      warehouse: "창고",
      quantity: "수량",
      quantityOnHand: "현재 재고 수량",
      reorderPoint: "재주문 기준점",
      unitCost: "단가",
      unitPrice: "단가",
      totalValue: "총 가치",
      location: "위치",
      status: "상태",
    },
  },

  // Orders
  orders: {
    title: "주문",
    description: "고객 주문 조회 및 관리",
    allOrders: "전체 주문",
    submittedOrders: "제출된 주문",
    submittedOrdersEmpty:
      "아직 제출된 주문이 없습니다. 재입고 탭에서 주문을 넣어주세요.",
    totalOrders: "총 주문 수",
    totalRevenue: "총 매출",
    avgOrderValue: "평균 주문 금액",
    onTimeDelivery: "정시 납기",
    itemsCount: "{count}건",
    quantity: "수량",
    leadTime: "리드 타임",
    leadTimeDays: "{days}일",
    createdDate: "생성일",
    table: {
      orderNumber: "주문 번호",
      orderId: "주문 ID",
      orderDate: "주문일",
      date: "날짜",
      customer: "고객",
      category: "카테고리",
      warehouse: "창고",
      items: "품목",
      value: "금액",
      totalValue: "총 금액",
      status: "상태",
      expectedDelivery: "예정 납기일",
      actualDelivery: "실제 납기일",
      created: "생성일",
      leadTime: "리드 타임",
    },
  },

  // Restocking
  restocking: {
    title: "재입고",
    description: "예산을 설정하고 수요 예측 기반의 재입고 권장 품목을 확인합니다.",
    budgetCardTitle: "가용 예산",
    budgetLabel: "예산",
    budgetHint:
      "슬라이더를 드래그하거나 값을 직접 입력하세요. 권장 품목이 자동으로 업데이트됩니다.",
    recommendationsTitle: "권장 품목",
    allocatedTotal: "배정 금액",
    remainingBudget: "잔여 예산",
    itemsSelected: "선택 품목 수",
    emptyState: "현재 예산과 필터 조건에서 재입고가 필요한 품목이 없습니다.",
    overBudget: "선택 금액이 예산을 초과했습니다.",
    placeOrder: "주문 넣기",
    placingOrder: "주문 처리 중…",
    orderPlaced:
      "주문 {orderNumber} 완료 · 예정 납기일 {expectedDelivery}",
    placeOrderFailed: "주문 처리에 실패했습니다",
    remove: "삭제",
    table: {
      sku: "SKU",
      item: "품목",
      trend: "트렌드",
      currentStock: "현재 재고",
      forecast: "수요 예측",
      unitCost: "단가",
      quantity: "수량",
      subtotal: "소계",
    },
  },

  // Finance/Spending
  finance: {
    title: "재무 대시보드",
    description: "매출, 비용 및 재무 성과 추적",
    totalRevenue: "총 매출",
    totalCosts: "총 비용",
    netProfit: "순이익",
    avgOrderValue: "평균 주문 금액",
    fromOrders: "{count}건의 주문에서",
    costBreakdown: "조달 + 운영 + 인건비 + 간접비",
    margin: "마진",
    perOrderRevenue: "주문당 매출",
    revenueVsCosts: {
      title: "월별 매출 대 비용",
      revenue: "매출",
      costs: "총 비용",
    },
    monthlyCostFlow: {
      title: "월별 비용 흐름",
      procurement: "조달",
      operational: "운영",
      labor: "인건비",
      overhead: "간접비",
    },
    categorySpending: {
      title: "카테고리별 지출",
      ofTotal: "전체 대비",
    },
    transactions: {
      title: "최근 거래",
      id: "ID",
      description: "설명",
      vendor: "공급업체",
      date: "날짜",
      amount: "금액",
    },
  },

  // Demand Forecast
  demand: {
    title: "수요 예측",
    description: "수요 동향 분석 및 향후 수요 예측",
    increasingDemand: "수요 증가",
    stableDemand: "수요 안정",
    decreasingDemand: "수요 감소",
    itemsCount: "{count}건",
    more: "더 보기...",
    demandForecasts: "수요 예측",
    table: {
      sku: "SKU",
      itemName: "품목명",
      currentDemand: "현재 수요",
      forecastedDemand: "예측 수요",
      change: "변화량",
      trend: "트렌드",
      period: "기간",
    },
  },

  // Reports
  reports: {
    title: "성과 보고서",
    description: "분기별 성과 지표 및 월별 추세 확인",
    quarterlyPerformance: {
      title: "분기별 성과",
      quarter: "분기",
      totalOrders: "총 주문 수",
      totalRevenue: "총 매출",
      avgOrderValue: "평균 주문 금액",
      fulfillmentRate: "처리율",
    },
    monthlyTrend: {
      title: "월별 매출 추세",
    },
    monthlyAnalysis: {
      title: "전월 대비 분석",
      month: "월",
      orders: "주문 수",
      revenue: "매출",
      change: "변화량",
      growthRate: "성장률",
    },
    summary: {
      totalRevenue: "총 매출 (연간 누계)",
      avgMonthlyRevenue: "월평균 매출",
      totalOrders: "총 주문 수 (연간 누계)",
      bestQuarter: "최우수 분기",
    },
  },

  // Filters
  filters: {
    timePeriod: "기간",
    location: "위치",
    category: "카테고리",
    orderStatus: "주문 상태",
    all: "전체",
    allMonths: "전체 월",
  },

  // Statuses
  status: {
    delivered: "배송 완료",
    shipped: "출고됨",
    processing: "처리 중",
    backordered: "백오더",
    submitted: "제출됨",
    inStock: "재고 있음",
    lowStock: "재고 부족",
    adequate: "적정",
  },

  // Trends
  trends: {
    increasing: "증가",
    stable: "안정",
    decreasing: "감소",
  },

  // Priority
  priority: {
    high: "높음",
    medium: "보통",
    low: "낮음",
  },

  // Categories
  categories: {
    circuitBoards: "회로기판",
    sensors: "센서",
    actuators: "액추에이터",
    controllers: "컨트롤러",
    powerSupplies: "전원장치",
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: "원자재",
    components: "부품",
    equipment: "설비",
    consumables: "소모품",
  },

  // Warehouses
  warehouses: {
    sanFrancisco: "샌프란시스코",
    london: "런던",
    tokyo: "도쿄",
  },

  // Months
  months: {
    jan: "1월",
    feb: "2월",
    mar: "3월",
    apr: "4월",
    may: "5월",
    jun: "6월",
    jul: "7월",
    aug: "8월",
    sep: "9월",
    oct: "10월",
    nov: "11월",
    dec: "12월",
    january: "1월",
    february: "2월",
    march: "3월",
    april: "4월",
    june: "6월",
    july: "7월",
    august: "8월",
    september: "9월",
    october: "10월",
    november: "11월",
    december: "12월",
  },

  // Profile Menu
  profile: {
    profileDetails: "프로필 상세",
    myTasks: "내 할 일",
    logout: "로그아웃",
  },

  // Profile Details Modal
  profileDetails: {
    title: "프로필 상세",
    email: "이메일",
    department: "부서",
    location: "근무지",
    phone: "전화번호",
    joinDate: "입사일",
    employeeId: "사원 번호",
    close: "닫기",
  },

  // Tasks Modal
  tasks: {
    title: "내 할 일",
    taskTitle: "할 일 제목",
    taskTitlePlaceholder: "할 일 제목을 입력하세요...",
    priority: "우선순위",
    dueDate: "마감일",
    addTask: "할 일 추가",
    noTasks: "등록된 할 일이 없습니다. 위에서 첫 번째 할 일을 추가하세요!",
  },

  // Language
  language: {
    english: "English",
    japanese: "일본어",
    selectLanguage: "언어 선택",
  },

  // Common
  common: {
    loading: "불러오는 중...",
    error: "오류",
    noData: "데이터가 없습니다",
    viewDetails: "상세 보기",
    close: "닫기",
    save: "저장",
    cancel: "취소",
    search: "검색",
    filter: "필터",
    export: "내보내기",
    items: "건",
  },

  // Product Names
  productNames: {
    "Single Layer PCB Assembly": "단층 PCB 조립",
    "Dual Layer PCB Assembly": "이층 PCB 조립",
    "Multi Layer PCB Assembly": "다층 PCB 조립",
    "Temperature Sensor Module": "온도 센서 모듈",
    "Humidity Sensor Module": "습도 센서 모듈",
    "Pressure Sensor Module": "압력 센서 모듈",
    "Proximity Sensor": "근접 센서",
    "Ultrasonic Distance Sensor": "초음파 거리 센서",
    "Micro Servo Motor": "마이크로 서보 모터",
    "Standard Servo Motor": "표준 서보 모터",
    "Stepper Motor NEMA 17": "스테퍼 모터 NEMA 17",
    "8-bit Microcontroller": "8비트 마이크로컨트롤러",
    "32-bit ARM Microcontroller": "32비트 ARM 마이크로컨트롤러",
    "Digital Signal Processor": "디지털 신호 처리장치",
    "3-Axis Accelerometer": "3축 가속도계",
    "Gyroscope Module": "자이로스코프 모듈",
    "Light Dependent Resistor": "광 의존 저항기",
    "Coil Spring Heavy Duty": "코일 스프링 (중하중용)",
    "Compression Spring": "압축 스프링",
    "PWM Motor Controller": "PWM 모터 컨트롤러",
    "H-Bridge Motor Driver": "H-브리지 모터 드라이버",
    "Stepper Motor NEMA 23": "스테퍼 모터 NEMA 23",
    "Drive Pulley": "구동 풀리",
    "LED Driver IC": "LED 드라이버 IC",
    "5V 10A Switching Power Supply": "5V 10A 스위칭 전원장치",
    "12V 5A Power Supply Module": "12V 5A 전원 모듈",
    "24V 3A Industrial Power Supply": "24V 3A 산업용 전원장치",
    "Dual Output ±15V Power Supply": "듀얼 출력 ±15V 전원장치",
    "48V DC Power Supply Unit": "48V DC 전원 유닛",
    "USB-C PD 100W Power Supply": "USB-C PD 100W 전원장치",
    "Battery Backup Power Supply": "배터리 백업 전원장치",
    "Adjustable Bench Power Supply": "가변 벤치 전원장치",
  },

  // Customer Names
  customerNames: {
    "MegaCorp Industries": "메가코프 인더스트리즈",
    "Elite Systems Corp": "엘리트 시스템즈",
    "Horizon Technologies": "호라이즌 테크놀로지스",
    "FastAssembly Ltd": "패스트어셈블리",
    "TechSolutions Group": "테크솔루션즈 그룹",
    "Apex Engineering": "에이펙스 엔지니어링",
    "Superior Manufacturing": "슈피리어 매뉴팩처링",
    "Cascade Manufacturing": "캐스케이드 매뉴팩처링",
    "Acme Manufacturing Corp": "애크미 제조",
    "TechBuild Industries": "테크빌드 인더스트리즈",
    "Advanced Components Inc": "어드밴스트 컴포넌츠",
    "Premier Industries": "프리미어 인더스트리즈",
    "Stellar Components Ltd": "스텔라 컴포넌츠",
    "Dynamic Systems Ltd": "다이나믹 시스템즈",
  },
};
