document.addEventListener('DOMContentLoaded', () => {
    const memoInput = document.getElementById('memo-input');
    const addBtn = document.getElementById('add-btn');
    const memoList = document.getElementById('memo-list');

    // 1. 頁面載入時，從 Local Storage 載入所有備忘錄
    loadMemos();

    // 2. 監聽「新增備忘」按鈕
    addBtn.addEventListener('click', addMemo);

    function addMemo() {
        const text = memoInput.value.trim();

        if (text === "") {
            alert("請輸入備忘事項！");
            return;
        }

        // 建立並顯示新的備忘清單項目
        const listItem = createMemoElement(text);
        memoList.appendChild(listItem);

        // 儲存到 Local Storage
        saveMemo(text);

        // 清空輸入框
        memoInput.value = "";
    }

    function createMemoElement(text) {
        const listItem = document.createElement('li');
        listItem.className = 'memo-item';

        const memoText = document.createElement('span');
        memoText.className = 'memo-text';
        memoText.textContent = text;
        listItem.appendChild(memoText);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '刪除';
        
        // 監聽刪除按鈕
        deleteBtn.addEventListener('click', () => {
            // 從畫面中移除
            memoList.removeChild(listItem);
            // 從 Local Storage 移除
            removeMemo(text);
        });
        
        listItem.appendChild(deleteBtn);
        return listItem;
    }

    // --- Local Storage 相關功能 ---

    // 取得所有儲存的備忘錄 (陣列格式)
    function getStoredMemos() {
        const memos = localStorage.getItem('memos');
        return memos ? JSON.parse(memos) : [];
    }

    // 將備忘錄陣列儲存到 Local Storage
    function saveMemos(memosArray) {
        localStorage.setItem('memos', JSON.stringify(memosArray));
    }

    // 載入並在畫面上顯示所有備忘錄
    function loadMemos() {
        const memos = getStoredMemos();
        memos.forEach(text => {
            const listItem = createMemoElement(text);
            memoList.appendChild(listItem);
        });
    }

    // 新增一個備忘錄到 Local Storage
    function saveMemo(text) {
        const memos = getStoredMemos();
        memos.push(text);
        saveMemos(memos);
    }

    // 從 Local Storage 移除指定的備忘錄
    function removeMemo(textToRemove) {
        let memos = getStoredMemos();
        // 過濾掉要刪除的文字
        memos = memos.filter(text => text !== textToRemove); 
        saveMemos(memos);
    }
});
