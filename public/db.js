let db;

const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("BudgetStore", { keyPath: "budgetID",autoIncrement: true });

};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
    this.transaction.onerror = function (event) {
      console.error(error);
    }
  };

function saveRecord(record) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  budgetStore.add( record );
}

function checkDatabase() {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  const getAll = budgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const budgetStore = transaction.objectStore("BudgetStore");
          budgetStore.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);