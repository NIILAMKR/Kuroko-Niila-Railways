// ====================================================================
// 広崎鉄道 データ定義エリア
// 今後の追加・変更は主にこのエリアで行います
// ====================================================================

// 1. 運賃データ (始発駅 H-01/白野 または HM-01/広崎第一空港 からの片道運賃)
// ※運賃計算機は、便宜的に FARE_DATA の最初の駅（H-01）以外の運賃を表示します。
// Key: 駅ナンバリング, Value: 運賃(円)
const FARE_DATA = {
    // 広崎新幹線 (H線) - 仮運賃
    'H-02': 300,  // 新示
    'H-03': 600,  // 広崎
    'H-04': 900,  // 黒子
    'H-05': 1200, // 京園

    // 広崎メトロ (HM線) - 仮運賃
    'HM-02': 250, // MR広崎外園
    'HM-03': 450, // 広崎中環
};

// 2. 路線データ
// themeはCSS変数名（--theme-[name]）に紐づくシンプルな名前を使用してください。
const ROUTE_DATA = [
    // ★広崎新幹線★
    {
        id: 'hirosakiS',
        code: 'H',
        name: '広崎新幹線',
        theme: 'hirosakiS',
        stations: [
            { code: 'H-01', name_jp: '白野', name_rt: 'しらの', type: 'big', transfer: [] }, // 始発駅
            { code: 'H-02', name_jp: '新示', name_rt: 'しんじ', type: 'normal', transfer: [] },
            { code: 'H-03', name_jp: '広崎', name_rt: 'ひろさき', type: 'transfer', transfer: ['ER', '海急'] },
            { code: 'H-04', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['ER', 'T'] },
            { code: 'H-05', name_jp: '京園', name_rt: 'よせと', type: 'big', transfer: ['ER都宮'] }
        ]
    },
    // ★広崎メトロ★
    {
        id: 'hirosakiM',
        code: 'HM',
        name: '広崎メトロ',
        theme: 'hirosakiM',
        stations: [
            { code: 'HM-01', name_jp: '広崎第一空港', name_rt: 'ひろさきだいいちくうこう', type: 'big', transfer: [] }, // 始発駅
            { code: 'HM-02', name_jp: 'MR広崎外園', name_rt: 'MRひろさきがいえん', type: 'normal', transfer: [] },
            { code: 'HM-03', name_jp: '広崎中環', name_rt: 'ひろさきセントラル', type: 'big', transfer: [] }
        ]
    },
];

// ====================================================================
// 広崎鉄道 ロジックエリア (ここは基本的に変更しないでください)
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {

    const tabsContainer = document.querySelector('.tabs');
    const mapWrapper = document.querySelector('.route-map-wrapper');
    const allStations = {}; 

    let isFirst = true;

    // 1. 路線図の描画とタブ機能の設定
    ROUTE_DATA.forEach(route => {
        // A. タブボタンの生成
        const btn = document.createElement('button');
        btn.classList.add('tab-btn');
        btn.setAttribute('data-target', `line-${route.id}`);
        btn.textContent = `${route.name} [${route.code}]`;
        if (isFirst) {
            btn.classList.add('active');
        }
        tabsContainer.appendChild(btn);

        // B. 路線図コンテナの生成
        const container = document.createElement('div');
        container.id = `line-${route.id}`;
        container.classList.add('route-map-container');
        if (isFirst) {
            container.classList.add('active');
        }

        // C. 路線図リスト（UL）の生成
        const ul = document.createElement('ul');
        ul.classList.add('route-map', `theme-${route.theme}`);

        route.stations.forEach(station => {
            // D. 駅要素（LI）の生成
            const li = document.createElement('li');
            li.classList.add('station-item');
            
            // 乗換駅かどうかでドットのクラスを決定
            const dotClass = station.type === 'big' ? 'big' : (station.type === 'transfer' ? 'transfer-dot' : '');
            
            li.innerHTML = `
                <span class="station-number">${station.code}</span>
                <div class="station-dot ${dotClass}"></div>
                <div class="station-name">
                    <ruby>${station.name_jp}<rt>${station.name_rt}</rt></ruby>
                </div>
            `;
            
            // 乗換情報
            if (station.transfer && station.transfer.length > 0) {
                const transfersDiv = document.createElement('div');
                transfersDiv.classList.add('transfers');
                
                station.transfer.forEach(tCode => {
                    
                    // 乗換先のバッジクラスを決定
                    let badgeClass = 'default';
                    const transferRoute = ROUTE_DATA.find(r => r.code === tCode);
                    if (transferRoute) {
                        badgeClass = transferRoute.theme; // 定義済み路線の場合
                    }

                    transfersDiv.innerHTML += `<span class="badge theme-${badgeClass}">乗換</span> ${tCode}線 `;
                });
                
                if (transfersDiv.innerHTML) {
                    li.appendChild(transfersDiv);
                }
            }

            ul.appendChild(li);
            allStations[station.code] = station;
        });

        container.appendChild(ul);
        mapWrapper.appendChild(container);
        isFirst = false;
    });

    // タブ切り替えロジック
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const targetId = e.target.getAttribute('data-target');
            document.querySelectorAll('.route-map-container').forEach(c => c.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        }
    });

    // 2. 運賃計算機の初期化
    const selectElement = document.getElementById('destination-select');
    const priceDisplay = document.getElementById('price-display');
    const resetButton = document.getElementById('calc-reset');

    // Selectオプションの生成
    for (const code in FARE_DATA) {
        const option = document.createElement('option');
        option.value = FARE_DATA[code];
        
        const stationInfo = allStations[code];
        const name = stationInfo ? stationInfo.name_jp : '駅名不明';

        option.textContent = `${code} ${name}`;
        selectElement.appendChild(option);
    }
    
    // 計算ロジック
    selectElement.addEventListener('change', (e) => {
        const value = e.target.value;
        animateValue(priceDisplay, value);
    });

    resetButton.addEventListener('click', () => {
        selectElement.selectedIndex = 0;
        priceDisplay.textContent = '---';
    });
    
    // アニメーション関数
    function animateValue(obj, end) {
        let startTimestamp = null;
        const duration = 500;
        const start = 0;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // 3. 時計機能
    const clockElement = document.getElementById('current-time');
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock(); 

    // 4. スマホメニュー
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    if(menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isActive = navList.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
        });
    }
});
