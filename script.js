// ====================================================================
// KNR鉄道 データ定義エリア
// 今後の追加・変更は主にこのエリアで行います
// ====================================================================

// 1. 運賃データ (始発駅 K01/黒子中央 からの片道運賃)
// Key: 駅ナンバリング, Value: 運賃(円)
const FARE_DATA = {
    // 黒子本線 [K]
    'K02': 220, // 北黒子
    'K03': 350, // 新桜橋 (乗換駅)
    'K04': 420, // 緑ヶ丘
    'K05': 580, // 天空町
    // 桜ノ宮線 [S]
    'S02': 450, // 桜ノ宮
    'S03': 600, // 夢見坂
    // 紅葉線 [R]
    'R01': 300, // 紅葉谷
    'R02': 500, // 終点
};

// 2. 路線データ
// 新しい路線を追加する場合は、この配列の末尾に新しいオブジェクトを追加してください。
// themeはCSSで定義した色（green, pink, koyoなど）を指定してください。
const ROUTE_DATA = [
    {
        id: 'kuroko',
        code: 'K',
        name: '黒子本線',
        theme: 'green',
        stations: [
            { code: 'K01', name_jp: '黒子中央', name_rt: 'くろこちゅうおう', type: 'big', transfer: ['R', 'S'] },
            { code: 'K02', name_jp: '北黒子', name_rt: 'きたくろこ', type: 'normal', transfer: [] },
            { code: 'K03', name_jp: '新桜橋', name_rt: 'しんさくらばし', type: 'transfer', transfer: ['S'] },
            { code: 'K04', name_jp: '緑ヶ丘', name_rt: 'みどりがおか', type: 'normal', transfer: [] },
            { code: 'K05', name_jp: '天空町', name_rt: 'てんくうまち', type: 'big', transfer: [] }
        ]
    },
    {
        id: 'sakura',
        code: 'S',
        name: '桜ノ宮線',
        theme: 'pink',
        stations: [
            { code: 'K03', name_jp: '新桜橋', name_rt: 'しんさくらばし', type: 'transfer', transfer: ['K'] },
            { code: 'S02', name_jp: '桜ノ宮', name_rt: 'さくらのみや', type: 'normal', transfer: [] },
            { code: 'S03', name_jp: '夢見坂', name_rt: 'ゆめみざか', type: 'big', transfer: [] }
        ]
    },
    {
        id: 'koyo',
        code: 'R',
        name: '紅葉線',
        theme: 'koyo',
        stations: [
            { code: 'K01', name_jp: '黒子中央', name_rt: 'くろこちゅうおう', type: 'big', transfer: ['K', 'S'] },
            { code: 'R01', name_jp: '紅葉谷', name_rt: 'こうようたに', type: 'normal', transfer: [] },
            { code: 'R02', name_jp: '終点', name_rt: 'しゅうてん', type: 'big', transfer: [] }
        ]
    }
];

// ====================================================================
// KNR鉄道 ロジックエリア (ここは基本的に変更しないでください)
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
        ul.classList.add('route-map', `${route.theme}-theme`);

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
                    if (tCode !== route.code) {
                        // 乗換先のラインコードに対応するバッジクラスを決定 (例: S線ならpink)
                        const transferRoute = ROUTE_DATA.find(r => r.code === tCode);
                        const badgeClass = transferRoute ? transferRoute.theme : '';
                        transfersDiv.innerHTML += `<span class="badge ${badgeClass}">乗換</span> ${tCode}線 `;
                    }
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
