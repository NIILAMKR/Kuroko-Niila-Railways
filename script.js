// ====================================================================
// KNR 黒子新桜鉄道 データ定義エリア
// ====================================================================

// 路線データ & 運賃設定
// priceIndex: ネットワーク全体での運賃基準値。
// ★「黒子駅」は全路線で 2190 に統一されているため、どれを使っても計算結果は同じになります。
const ROUTE_DATA = [
    // ★広崎新幹線★
    {
        id: 'hirosakiS',
        code: 'H',
        name: '広崎新幹線',
        theme: 'hirosakiS',
        stations: [
            { code: 'H-01', name_jp: '白野', name_rt: 'しらの', type: 'big', transfer: [], priceIndex: 0 },
            { code: 'H-02', name_jp: '新示', name_rt: 'しんじ', type: 'normal', transfer: [], priceIndex: 800 },
            { code: 'H-03', name_jp: '広崎', name_rt: 'ひろさき', type: 'big', transfer: ['ER', '海急'], priceIndex: 1480 },
            { code: 'H-04', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['T', 'ER', 'KN'], priceIndex: 2190 },
            { code: 'H-05', name_jp: '京園', name_rt: 'よせと', type: 'big', transfer: ['ER都宮'], priceIndex: 2630}
        ]
    },
    // ★広崎メトロ★
    {
        id: 'hirosakiM',
        code: 'HM',
        name: '広崎メトロ',
        theme: 'hirosakiM',
        stations: [
            { code: 'HM-01', name_jp: '広崎第一空港', name_rt: 'ひろさきだいいちくうこう', type: 'big', transfer: [], priceIndex: 0 },
            { code: 'HM-02', name_jp: 'MR広崎外園', name_rt: 'MRひろさきがいえん', type: 'normal', transfer: [], priceIndex: 200 },
            { code: 'HM-03', name_jp: '広崎中環', name_rt: 'ひろさきセントラル', type: 'big', transfer: [], priceIndex: 400 },
            { code: 'HM-04', name_jp: 'MR青旗', name_rt: 'MRあおはた', type: 'normal', transfer: [], priceIndex: 600}
        ]
    },
    // ★土崎本線★ (0になっていた箇所を補完しました)
    {
        id: 'tsuchisaki',
        code: 'T',
        name :'土崎本線',
        theme: 'tsuchisaki',
        stations: [
            { code: 'T-01', name_jp: 'MR土都', name_rt: 'MRつちみや', type: 'big', transfer: [], priceIndex: 2440 },
            { code: 'T-02', name_jp: '彩都', name_rt: 'あやと', type: 'normal', transfer: [], priceIndex: 2310 },
            { code: 'T-03', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['H', 'ER', 'KN'], priceIndex: 2190 },
            // ↓ 数値を補完 (0のままだと計算がおかしくなるため)
            { code: 'T-04', name_jp: '島洲', name_rt: 'します', type: 'normal', transfer: [], priceIndex: 2050 },
            { code: 'T-05', name_jp: 'MR新大宮', name_rt: 'MRしんおおみや', type: 'normal', transfer: [], priceIndex: 1900 },
            { code: 'T-06', name_jp: 'MR新広崎', name_rt: 'MRしんひろさき', type: 'normal', transfer: [], priceIndex: 1750 }
        ]
    },
    // ★黒沼線★
    {
        id: 'kuronuma',
        code: 'KN',
        name: '黒沼線',
        theme: 'kuronuma',
        stations: [
            { code: 'KN-01', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['H', 'T', 'ER'], priceIndex: 2190 },
            { code: 'KN-02', name_jp: '黒沼', name_rt: 'くろぬま', type: 'normal', transfer: [], priceIndex: 2320 }
        ]
    },
];

// 乗換加算運賃 (統一計算のため0として扱います)
const TRANSFER_FEE = 0;

// ====================================================================
// ロジックエリア
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {

    const tabsContainer = document.querySelector('.tabs');
    const mapWrapper = document.querySelector('.route-map-wrapper');
    
    // 全駅リスト（計算用）
    let allStationsList = [];

    let isFirst = true;

    // 1. 路線図描画 & データ収集
    ROUTE_DATA.forEach(route => {
        // タブ生成
        const btn = document.createElement('button');
        btn.classList.add('tab-btn');
        btn.setAttribute('data-target', `line-${route.id}`);
        btn.textContent = `${route.name} [${route.code}]`;
        if (isFirst) btn.classList.add('active');
        tabsContainer.appendChild(btn);

        // コンテナ生成
        const container = document.createElement('div');
        container.id = `line-${route.id}`;
        container.classList.add('route-map-container');
        if (isFirst) container.classList.add('active');

        // リスト生成
        const ul = document.createElement('ul');
        ul.classList.add('route-map', `theme-${route.theme}`);

        route.stations.forEach(station => {
            // 駅データをリストに保存
            // 参照渡しによる混線防ぐためオブジェクトをコピー
            const stationData = { ...station, lineCode: route.code, lineName: route.name };
            allStationsList.push(stationData);

            // HTML生成
            const li = document.createElement('li');
            li.classList.add('station-item');
            
            const dotClass = station.type === 'big' ? 'big' : (station.type === 'transfer' ? 'transfer-dot' : '');
            
            li.innerHTML = `
                <span class="station-number">${station.code}</span>
                <div class="station-dot ${dotClass}"></div>
                <div class="station-name">
                    <ruby>${station.name_jp}<rt>${station.name_rt}</rt></ruby>
                </div>
            `;
            
            if (station.transfer && station.transfer.length > 0) {
                const transfersDiv = document.createElement('div');
                transfersDiv.classList.add('transfers');
                station.transfer.forEach(tCode => {
                    let badgeClass = 'default';
                    // 路線コードからテーマカラーを探す
                    const transferRoute = ROUTE_DATA.find(r => r.code === tCode);
                    if (transferRoute) {
                        badgeClass = transferRoute.theme;
                    }
                    transfersDiv.innerHTML += `<span class="badge theme-${badgeClass}">乗換</span> ${tCode}線 `;
                });
                if (transfersDiv.innerHTML) li.appendChild(transfersDiv);
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
        mapWrapper.appendChild(container);
        isFirst = false;
    });

    // タブ切り替え
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            document.querySelectorAll('.route-map-container').forEach(c => c.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        }
    });

    // 2. 運賃計算機（始発・到着 選択式）
    const startSelect = document.getElementById('start-select');
    const endSelect = document.getElementById('end-select');
    const priceDisplay = document.getElementById('price-display');
    const resetButton = document.getElementById('calc-reset');

    // ★修正ポイント: セレクトボックスの重複排除ロジック
    function populateSelects() {
        // 追加済みの駅名を記録するセット
        const addedStationNames = new Set();

        allStationsList.forEach((station, index) => {
            // まだ追加されていない駅名の場合のみ追加する
            if (!addedStationNames.has(station.name_jp)) {
                
                // 黒子のように複数路線にある場合は、路線コードではなく共通表記にする工夫
                // transfer配列を持っている場合は「乗換」と表記するなど
                let displayName = "";
                if (station.transfer && station.transfer.length > 0) {
                     displayName = `[乗換] ${station.name_jp}`;
                } else {
                     displayName = `${station.code} ${station.name_jp}`;
                }

                // option生成
                const optStart = document.createElement('option');
                optStart.value = index; // indexは「最初に見つかったその駅」の番号になります
                optStart.textContent = displayName;
                startSelect.appendChild(optStart);

                const optEnd = document.createElement('option');
                optEnd.value = index;
                optEnd.textContent = displayName;
                endSelect.appendChild(optEnd);

                // 追加済みリストに登録
                addedStationNames.add(station.name_jp);
            }
        });
    }
    populateSelects();

    // 運賃計算ロジック
    function calculateFare() {
        const startIndex = startSelect.value;
        const endIndex = endSelect.value;

        // どちらかが未選択、または同じ駅なら計算しない
        if (startIndex === "" || endIndex === "" || startIndex === endIndex) {
            priceDisplay.textContent = "---";
            return;
        }

        const startStation = allStationsList[startIndex];
        const endStation = allStationsList[endIndex];

        // 運賃計算
        // 全路線で「黒子」駅のpriceIndexは「2190」で統一されているため、
        // 重複排除して「H-04の黒子」が選ばれても、「T-03の黒子」として計算されても
        // 数値上の結果は同じになります。
        let fare = Math.abs(startStation.priceIndex - endStation.priceIndex);

        // 最低運賃保証
        if (fare < 150) fare = 150;

        animateValue(priceDisplay, fare);
    }

    startSelect.addEventListener('change', calculateFare);
    endSelect.addEventListener('change', calculateFare);

    resetButton.addEventListener('click', () => {
        startSelect.selectedIndex = 0;
        endSelect.selectedIndex = 0;
        priceDisplay.textContent = '---';
    });
    
    function animateValue(obj, end) {
        let startTimestamp = null;
        const duration = 400;
        const start = parseInt(obj.textContent) || 0;
        if (isNaN(start)) { obj.innerHTML = end; return; }

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

    // 3. 時計 & スマホメニュー
    const clockElement = document.getElementById('current-time');
    function updateClock() {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('ja-JP', { hour12: false });
    }
    setInterval(updateClock, 1000);
    updateClock(); 

    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    if(menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isActive = navList.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
        });
    }
});
