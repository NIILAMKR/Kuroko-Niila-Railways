// ====================================================================
// KNR 黒子新桜鉄道 データ定義エリア
// ====================================================================

const ROUTE_DATA = [
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
    {
        id: 'tsuchisaki',
        code: 'T',
        name :'土崎本線',
        theme: 'tsuchisaki',
        stations: [
            { code: 'T-01', name_jp: 'MR土都', name_rt: 'MRつちみや', type: 'big', transfer: [], priceIndex: 2440 },
            { code: 'T-02', name_jp: '彩都', name_rt: 'あやと', type: 'normal', transfer: [], priceIndex: 2310 },
            { code: 'T-03', name_jp: '黒子', name_rt: 'くろこ', type: 'big', transfer: ['H', 'ER', 'KN'], priceIndex: 2190 },
            { code: 'T-04', name_jp: '島洲', name_rt: 'します', type: 'normal', transfer: [], priceIndex: 2050 },
            { code: 'T-05', name_jp: 'MR新大宮', name_rt: 'MRしんおおみや', type: 'normal', transfer: [], priceIndex: 1900 },
            { code: 'T-06', name_jp: 'MR新広崎', name_rt: 'MRしんひろさき', type: 'normal', transfer: [], priceIndex: 1750 }
        ]
    },
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

const TRANSFER_FEE = 0; // 乗り換え加算なし

// ====================================================================
// ロジックエリア
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.querySelector('.tabs');
    const mapWrapper = document.querySelector('.route-map-wrapper');
    let allStationsList = [];
    let isFirst = true;

    // 1. 路線図描画
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

        const ul = document.createElement('ul');
        ul.classList.add('route-map', `theme-${route.theme}`);

        route.stations.forEach(station => {
            station.lineCode = route.code;
            station.lineName = route.name;
            allStationsList.push(station);

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
            
            // ★【修正箇所】乗換表示を正式名称にする
            if (station.transfer && station.transfer.length > 0) {
                const transfersDiv = document.createElement('div');
                transfersDiv.classList.add('transfers');
                
                station.transfer.forEach(tCode => {
                    // ROUTE_DATAから該当する路線の正式名称(name)とテーマ(theme)を探す
                    const targetRoute = ROUTE_DATA.find(r => r.code === tCode);
                    
                    let displayName = tCode + '線'; // 見つからない場合のバックアップ
                    let badgeClass = 'default';

                    if (targetRoute) {
                        displayName = targetRoute.name; // 「広崎メトロ」などの正式名称
                        badgeClass = targetRoute.theme; // cssのテーマカラー
                    }

                    transfersDiv.innerHTML += `<span class="badge theme-${badgeClass}">乗換</span> ${displayName} `;
                });
                li.appendChild(transfersDiv);
            }
            ul.appendChild(li);
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

    // 2. 運賃計算機（重複排除版）
    const startSelect = document.getElementById('start-select');
    const endSelect = document.getElementById('end-select');
    const priceDisplay = document.getElementById('price-display');
    const resetButton = document.getElementById('calc-reset');

    function populateSelects() {
        const addedNames = new Set();
        allStationsList.forEach((station, index) => {
            if (!addedNames.has(station.name_jp)) {
                const optText = (station.transfer.length > 0) ? `[乗換] ${station.name_jp}` : `${station.code} ${station.name_jp}`;
                
                const optStart = document.createElement('option');
                optStart.value = index;
                optStart.textContent = optText;
                startSelect.appendChild(optStart);

                const optEnd = document.createElement('option');
                optEnd.value = index;
                optEnd.textContent = optText;
                endSelect.appendChild(optEnd);

                addedNames.add(station.name_jp);
            }
        });
    }
    populateSelects();

    function calculateFare() {
        const sIdx = startSelect.value;
        const eIdx = endSelect.value;
        if (sIdx === "" || eIdx === "" || sIdx === eIdx) {
            priceDisplay.textContent = "---";
            return;
        }
        const fare = Math.abs(allStationsList[sIdx].priceIndex - allStationsList[eIdx].priceIndex);
        const finalFare = fare < 150 ? 150 : fare; // 最低運賃150円
        animateValue(priceDisplay, finalFare);
    }

    startSelect.addEventListener('change', calculateFare);
    endSelect.addEventListener('change', calculateFare);
    resetButton.addEventListener('click', () => {
        startSelect.selectedIndex = 0; endSelect.selectedIndex = 0; priceDisplay.textContent = '---';
    });

    function animateValue(obj, end) {
        let startTimestamp = null;
        const duration = 400;
        const start = parseInt(obj.textContent) || 0;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = end;
        };
        window.requestAnimationFrame(step);
    }

    // 3. 時計
    const clockElement = document.getElementById('current-time');
    function updateClock() {
        clockElement.textContent = new Date().toLocaleTimeString('ja-JP', { hour12: false });
    }
    setInterval(updateClock, 1000);
    updateClock();
});
