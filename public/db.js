let db;

// Create a new DBRequest for BudgetDB database in IndexedDB.
const request = window.indexedDB.open("BudgetDB", 1);

// Create BudgetStore and set keyPath and AutoIncrement to true.
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

// Display error.
request.onerror = function (event) {
    this.transaction.onerror = function (event) {
      console.error(error);
    }
  };

// Create a transaction on the pending DB with RW access. Access the pending object store and add record to the store with add method.
function saveRecord(record) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  budgetStore.add( record );
}

// Open a transaction on the pending DB. Access the pending object store and get all records from store and set to variable.
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

// Listne for app coming back online.
window.addEventListener('online', checkDatabase);