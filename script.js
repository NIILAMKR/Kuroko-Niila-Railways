document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 時計機能 (Real-time Clock) ---
    const clockElement = document.getElementById('current-time');

    function updateClock() {
        const now = new Date();
        // 日本時間に合わせるなどの処理が必要な場合はここに追加
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    // 1秒ごとに更新
    setInterval(updateClock, 1000);
    updateClock(); // 初回実行


    // --- 2. タブ切り替え機能 (Tabs) ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const routeContainers = document.querySelectorAll('.route-map-container');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 全てのボタンからactiveを外す
            tabButtons.forEach(b => b.classList.remove('active'));
            // クリックされたボタンにactiveをつける
            btn.classList.add('active');

            // 表示するターゲットIDを取得
            const targetId = btn.getAttribute('data-target');

            // 全てのコンテナを非表示にする
            routeContainers.forEach(c => c.classList.remove('active'));
            // ターゲットだけ表示する
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- 3. 運賃計算機能 (Fare Calculator) ---
    const selectElement = document.getElementById('destination-select');
    const priceDisplay = document.getElementById('price-display');
    const resetButton = document.getElementById('calc-reset');

    selectElement.addEventListener('change', (e) => {
        const value = e.target.value;
        // アニメーションっぽく表示
        animateValue(priceDisplay, value);
    });

    resetButton.addEventListener('click', () => {
        selectElement.selectedIndex = 0; // 最初の選択肢に戻す
        priceDisplay.textContent = '---';
    });

    // 数字をパラパラとカウントアップさせる演出関数
    function animateValue(obj, end) {
        let startTimestamp = null;
        const duration = 500; // ミリ秒
        const start = 0;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // 整数で表示
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end; // 最後に正確な値を入れる
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // --- 4. スマホメニュー (簡易版) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if(menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            // CSSで .nav-list.open { display: block; ... } 等の記述が必要
            // 今回はalertのみで動作確認
            if(navList.style.display === 'flex') {
                navList.style.display = 'none';
            } else {
                navList.style.display = 'flex';
                navList.style.flexDirection = 'column';
                navList.style.position = 'absolute';
                navList.style.top = '60px';
                navList.style.right = '0';
                navList.style.background = 'white';
                navList.style.padding = '20px';
                navList.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
            }
        });
    }

});
