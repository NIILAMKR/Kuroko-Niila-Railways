// ====================================================================
// KNR 黒子新桜鉄道 データ定義エリア
// ====================================================================

// 路線データ & 運賃設定
// priceIndex: 基準となる運賃係数です。この数値の差額が運賃になります。
// 例: H-01(0) から H-02(300) への運賃 = |300 - 0| = 300円
const ROUTE_DATA = [
    // ★広崎新幹線★
    {
        id: 'hirosakiS',
        code: 'H',
        name: '広崎新幹線',
        theme: 'hirosakiS',
        stations: [
            // priceIndexを調整することで、駅間の運賃を自由に設定できます
            { code: 'H-01', name_jp: '白野', name_rt: 'しらの', type: 'big', transfer: [], priceIndex: 0 },
            { code: 'H-02', name_jp: '新示', name_rt: 'しんじ', type: 'normal', transfer: [], priceIndex: 300 },
            { code: 'H-03', name_jp: '広崎', name_rt: 'ひろさき', type: 'transfer', transfer: ['ER', '海急'], priceIndex: 800 },
            { code: 'H-04', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['ER', 'T'], priceIndex: 1200 },
            { code: 'H-05', name_jp: '京園', name_rt: 'よせと', type: 'big', transfer: ['ER都宮'], priceIndex: 1600 }
        ]
    },
    // ★広崎メトロ★
    {
        id: 'hirosakiM',
        code: 'HM',
        name: '広崎メトロ',
        theme: 'hirosakiM',
        stations: [
            // メトロは少し安めに設定したい場合、差分を小さくします
            { code: 'HM-01', name_jp: '広崎第一空港', name_rt: 'ひろさきだいいちくうこう', type: 'big', transfer: [], priceIndex: 0 },
            { code: 'HM-02', name_jp: 'MR広崎外園', name_rt: 'MRひろさきがいえん', type: 'normal', transfer: [], priceIndex: 200 },
            { code: 'HM-03', name_jp: '広崎中環', name_rt: 'ひろさきセントラル', type: 'big', transfer: [], priceIndex: 400 }
        ]
    },
];

// 乗換加算運賃 (異なる路線の場合にプラスされる金額)
const TRANSFER_FEE = 200;

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
            // 駅データをリストに保存（路線コードも付与）
            station.lineCode = route.code; 
            allStationsList.push(station);

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
                    const transferRoute = ROUTE_DATA.find(r => r.code === tCode);
                    if (transferRoute) badgeClass = transferRoute.theme;
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

    // セレクトボックスに選択肢を追加
    function populateSelects() {
        allStationsList.forEach((station, index) => {
            // valueにindex（配列の番号）を持たせる
            const optionText = `${station.code} ${station.name_jp}`;
            
            const optStart = document.createElement('option');
            optStart.value = index; 
            optStart.textContent = optionText;
            startSelect.appendChild(optStart);

            const optEnd = document.createElement('option');
            optEnd.value = index;
            optEnd.textContent = optionText;
            endSelect.appendChild(optEnd);
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

        // 1. 基本運賃（priceIndexの差分）
        // 路線が違う場合は、それぞれの路線の始点からの距離の差分などを考慮する必要がありますが、
        // ここでは簡易的に「数値の差分」をベースにします。
        // ※厳密な計算が必要な場合は、全通しのpriceIndexを設計するか、テーブルデータにする必要があります。
        // 今回は「同一路線内」または「単純な加算」で処理します。

        let fare = 0;

        if (startStation.lineCode === endStation.lineCode) {
            // 同一路線：単純な引き算
            fare = Math.abs(startStation.priceIndex - endStation.priceIndex);
        } else {
            // 異なる路線：それぞれのインデックスを足して、乗換料金を加算（簡易ロジック）
            // 実用的には「接続駅」を経由する計算が必要ですが、コードが複雑になるため
            // ここでは「両方のpriceIndexの合計 + 乗換料金」とします（または任意のロジックに変更可）
            fare = startStation.priceIndex + endStation.priceIndex + TRANSFER_FEE;
        }

        // 最低運賃保証 (初乗り150円など)
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

    // 3. 時計 & スマホメニュー (変更なし)
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
