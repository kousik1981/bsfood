// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxzNhxOLNbK5TKq-zDrarFLUbkojW-Lug",
  authDomain: "bsfooderp.firebaseapp.com",
  databaseURL: "https://bsfooderp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bsfooderp",
  storageBucket: "bsfooderp.firebasestorage.app",
  messagingSenderId: "520628023883",
  appId: "1:520628023883:web:20ad7a3174be400ace93ce"
};

// Initialize Firebase with error handling
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}
const database = firebase.database();

// Data arrays
let clients = [];
let products = [
  { id: 'P1', name: '1000 ml Mustard Oil', price: 200, stock: 100 },
  { id: 'P2', name: '500 ml Mustard Oil', price: 110, stock: 100 }
];
let materials = [
  { id: 'M1', name: 'Mustard Seeds', unit: 'kg', stock: 1000 },
  { id: 'M2', name: 'Bottles', unit: 'units', stock: 200 }
];
let invoices = [];
let payments = [];
let expenses = [];

// Load data from Firebase
function loadData() {
  console.log("Loading data...");
  database.ref('clients').once('value').then(snapshot => {
    clients = snapshot.val() || [];
    console.log("Clients loaded:", clients);
    updateClientSelect();
    displayClients();
  }).catch(error => console.error("Error loading clients:", error));

  database.ref('invoices').once('value').then(snapshot => {
    invoices = snapshot.val() || [];
    console.log("Invoices loaded:", invoices);
    updateInvoiceSelect();
    updateDashboard();
  }).catch(error => console.error("Error loading invoices:", error));
}

// Save data to Firebase
function saveData(data, path) {
  console.log("Saving data to", path, ":", data);
  database.ref(path).set(data).then(() => {
    console.log("Data saved successfully to", path);
  }).catch(error => {
    console.error("Error saving data to", path, ":", error);
  });
}

// Tab navigation
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  if (tabId === 'dashboard') updateDashboard();
  if (tabId === 'clients') displayClients();
  if (tabId === 'billing') updateClientSelect();
  if (tabId === 'inventory') displayInventory();
  if (tabId === 'payments') updateInvoiceSelect();
  if (tabId === 'sales') updateSalesReport();
}

// Dashboard update
function updateDashboard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const financialYearStart = new Date(currentYear, 3, 1);
  if (currentMonth < 3) financialYearStart.setFullYear(currentYear - 1);

  const currentMonthSales = invoices
    .filter(i => new Date(i.date).getMonth() === currentMonth && new Date(i.date).getFullYear() === currentYear)
    .reduce((sum, i) => sum + i.total, 0);
  const currentFYSales = invoices
    .filter(i => new Date(i.date) >= financialYearStart && new Date(i.date) <= now)
    .reduce((sum, i) => sum + i.total, 0);
  const currentMonthExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear)
    .reduce((sum, e) => sum + e.amount, 0);
  const profit = (currentFYSales - currentMonthExpenses).toFixed(2);

  document.getElementById('current-month-sales').textContent = `₹${currentMonthSales.toFixed(2)}`;
  document.getElementById('current-fy-sales').textContent = `₹${currentFYSales.toFixed(2)}`;
  document.getElementById('profit').textContent = `₹${profit}`;
}

// Client management
function saveClient() {
  const client = {
    id: document.getElementById('client-id').value || 'C' + (clients.length + 1),
    name: document.getElementById('client-name').value,
    contact: document.getElementById('client-contact').value,
    address: document.getElementById('client-address').value
  };
  if (!client.name || !client.contact) {
    alert('Please enter name and contact');
    return;
  }
  if (!client.id.startsWith('C')) {
    const index = clients.findIndex(c => c.id === client.id);
    clients[index] = client;
  } else {
    clients.push(client);
  }
  saveData(clients, 'clients');
  document.getElementById('client-id').value = '';
  document.getElementById('client-name').value = '';
  document.getElementById('client-contact').value = '';
  document.getElementById('client-address').value = '';
  displayClients();
  updateClientSelect();
}

function displayClients() {
  document.getElementById('client-list').innerHTML = `
    <table class="w-full">
      <tr class="bg-blue-800 text-white"><th>Name</th><th>Contact</th><th>Address</th><th>Action</th></tr>
      ${clients.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.contact}</td>
          <td>${c.address}</td>
          <td><button onclick="editClient('${c.id}')" class="text-yellow-300">Edit</button></td>
        </tr>
      `).join('')}
    </table>`;
}

function editClient(clientId) {
  const client = clients.find(c => c.id === clientId);
  document.getElementById('client-id').value = client.id;
  document.getElementById('client-name').value = client.name;
  document.getElementById('client-contact').value = client.contact;
  document.getElementById('client-address').value = client.address;
}

function updateClientSelect() {
  const select = document.getElementById('invoice-client');
  select.innerHTML = '<option value="">Select Client</option>';
  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    select.appendChild(option);
  });
}

// Billing
function addInvoiceItem() {
  // Simplified to single item for now
  // Can expand to multiple items later
}

function createInvoice() {
  const clientId = document.getElementById('invoice-client').value;
  const productId = document.getElementById('invoice-product').value;
  const quantity = document.getElementById('invoice-quantity').value;
  if (!clientId || !productId || !quantity) {
    alert('Please fill all fields');
    return;
  }
  const product = products.find(p => p.id === productId);
  const total = product.price * quantity;
  const invoice = {
    id: 'INV' + (invoices.length + 1),
    clientId,
    productId,
    quantity,
    total,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };
  invoices.push(invoice);
  product.stock -= quantity;
  saveData(invoices, 'invoices');
  saveData(products, 'products');
  document.getElementById('invoice-quantity').value = '';
  document.getElementById('invoice-result').textContent = `Invoice ${invoice.id} created`;
  updateInvoiceSelect();
  updateDashboard();
  displayInventory();
}

function updateProductSelect() {
  const select = document.getElementById('invoice-product');
  select.innerHTML = '<option value="">Select Product</option>';
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name;
    select.appendChild(option);
  });
}

// Inventory
function displayInventory() {
  document.getElementById('product-inventory').innerHTML = `
    <table class="w-full">
      <tr class="bg-blue-800 text-white"><th>Product</th><th>Stock</th></tr>
      ${products.map(p => `<tr><td>${p.name}</td><td>${p.stock}</td></tr>`).join('')}
    </table>`;
  document.getElementById('raw-material-inventory').innerHTML = `
    <table class="w-full">
      <tr class="bg-blue-800 text-white"><th>Material</th><th>Stock</th></tr>
      ${materials.map(m => `<tr><td>${m.name}</td><td>${m.stock} ${m.unit}</td></tr>`).join('')}
    </table>`;
}

// Payments
function updateInvoiceSelect() {
  const select = document.getElementById('payment-invoice');
  select.innerHTML = '<option value="">Select Invoice</option>';
  invoices.filter(i => i.status === 'Pending').forEach(invoice => {
    const option = document.createElement('option');
    option.value = invoice.id;
    option.textContent = `${invoice.id} - ₹${invoice.total}`;
    select.appendChild(option);
  });
}

function recordPayment() {
  const invoiceId = document.getElementById('payment-invoice').value;
  const amount = document.getElementById('payment-amount').value;
  if (!invoiceId || !amount) {
    alert('Please select invoice and enter amount');
    return;
  }
  const invoice = invoices.find(i => i.id === invoiceId);
  payments.push({ id: 'PAY' + (payments.length + 1), invoiceId, amount, date: new Date().toISOString().split('T')[0] });
  const totalPaid = payments.filter(p => p.invoiceId === invoiceId).reduce((sum, p) => sum + Number(p.amount), 0);
  invoice.status = totalPaid >= invoice.total ? 'Paid' : 'Pending';
  saveData(invoices, 'invoices');
  saveData(payments, 'payments');
  document.getElementById('payment-amount').value = '';
  document.getElementById('payment-result').textContent = 'Payment recorded';
  updateInvoiceSelect();
  updateDashboard();
}

// Sales Report
function updateSalesReport() {
  document.getElementById('sales-report').innerHTML = '<p>Select date range to generate report</p>';
}

function generateSalesReport() {
  const startDate = document.getElementById('sales-start-date').value;
  const endDate = document.getElementById('sales-end-date').value;
  const filteredInvoices = invoices.filter(i => {
    const date = new Date(i.date);
    return (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
  });
  document.getElementById('sales-report').innerHTML = `
    <table class="w-full">
      <tr class="bg-blue-800 text-white"><th>Invoice</th><th>Total</th><th>Date</th><th>Status</th></tr>
      ${filteredInvoices.map(i => `<tr><td>${i.id}</td><td>₹${i.total}</td><td>${i.date}</td><td>${i.status}</td></tr>`).join('')}
    </table>`;
}

// Initialize
window.addEventListener('load', () => {
  loadData();
  updateProductSelect();
  showTab('dashboard');
});
