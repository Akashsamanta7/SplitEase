const dashboard = document.getElementById('dashboard');
const groupView = document.getElementById('groupView');
const groupList = document.getElementById('groupList');
const emptyDashboard = document.getElementById('emptyDashboard');
const createGroupFab = document.getElementById('createGroupFab');
const createGroupModal = document.getElementById('createGroupModal');
const closeCreateGroupModal = document.getElementById('closeCreateGroupModal');
const cancelCreateGroup = document.getElementById('cancelCreateGroup');
const groupNameInput = document.getElementById('groupNameInput');
const groupMembersInput = document.getElementById('groupMembersInput');
const saveGroup = document.getElementById('saveGroup');
const backBtn = document.getElementById('backBtn');
const groupNameHeader = document.getElementById('groupNameHeader');
const editGroupBtn = document.getElementById('editGroupBtn');
const editGroupModal = document.getElementById('editGroupModal');
const closeEditGroupModal = document.getElementById('closeEditGroupModal');
const cancelEditGroup = document.getElementById('cancelEditGroup');
const editGroupNameInput = document.getElementById('editGroupNameInput');
const editGroupMembersInput = document.getElementById('editGroupMembersInput');
const saveEditGroup = document.getElementById('saveEditGroup');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const addExpenseModal = document.getElementById('addExpenseModal');
const closeAddExpenseModal = document.getElementById('closeAddExpenseModal');
const cancelAddExpense = document.getElementById('cancelAddExpense');
const expenseDescription = document.getElementById('expenseDescription');
const expenseAmount = document.getElementById('expenseAmount');
const paidBySelect = document.getElementById('paidBySelect');
const saveExpense = document.getElementById('saveExpense');
const expenseList = document.getElementById('expenseList');
const balanceDetails = document.getElementById('balanceDetails');
const aiBtn = document.getElementById('aiBtn');
const aiOptionsModal = document.getElementById('aiOptionsModal');
const closeAiModal = document.getElementById('closeAiModal');
const aiMessageContainer = document.getElementById('aiMessageContainer');
const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');

// App State
let currentGroup = null;
let appData = JSON.parse(localStorage.getItem('appData')) || { groups: [], expenses: [] };

// Initialize App
function initApp() {
    console.log('Initializing app...');
    showStartScreen();
}

// Screens
function showStartScreen() {
    startScreen.style.display = 'flex';
    dashboard.style.display = 'none';
    groupView.style.display = 'none';
}

function showDashboard() {
    startScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    groupView.style.display = 'none';
    renderGroupList();
}

// Render Groups
function renderGroupList() {
    const groups = appData.groups;
    if (groups.length === 0) {
        groupList.style.display = 'none';
        emptyDashboard.style.display = 'block';
    } else {
        groupList.style.display = 'block';
        emptyDashboard.style.display = 'none';
        groupList.innerHTML = '';
        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.setAttribute('data-group-id', group.id);
            groupItem.innerHTML = `<div class="group-name">${group.name}</div>
                                   <div class="group-members">Members: ${group.members.join(', ')}</div>
                                   <button class="delete-group-btn" data-group-id="${group.id}">🗑️</button>`;
            groupList.appendChild(groupItem);

            groupItem.querySelector('.delete-group-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                confirmDeleteGroup(group.id);
            });

            groupItem.addEventListener('click', e => {
                if (!e.target.classList.contains('delete-group-btn')) showGroupView(group);
            });
        });
    }
}

// Group View
function showGroupView(group) {
    currentGroup = group;
    startScreen.style.display = 'none';
    dashboard.style.display = 'none';
    groupView.style.display = 'flex';
    groupNameHeader.textContent = group.name;
    renderExpenses();
    updateBalanceSummary();
    populatePaidBySelect();
}

// Render Expenses
function renderExpenses() {
    const groupExpenses = appData.expenses.filter(e => e.groupId === currentGroup.id);
    expenseList.innerHTML = '';
    if (groupExpenses.length === 0) {
        expenseList.innerHTML = '<div class="empty-state"><p>No expenses yet. Add your first expense!</p></div>';
        return;
    }
    groupExpenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `<button class="delete-expense" data-expense-id="${expense.id}">🗑️</button>
                                 <div class="expense-header">
                                    <div class="expense-description">${expense.description}</div>
                                    <div class="expense-amount">₹${expense.amount}</div>
                                 </div>
                                 <div class="expense-meta">Paid by: ${expense.paidBy}</div>`;
        expenseList.appendChild(expenseItem);

        expenseItem.querySelector('.delete-expense').addEventListener('click', () => {
            deleteExpense(expense.id);
        });
    });
}

// Get Balances
function getBalances() {
    const groupExpenses = appData.expenses.filter(e => e.groupId === currentGroup.id);
    const members = currentGroup.members;
    const balances = {};
    members.forEach(member => balances[member] = 0);

    groupExpenses.forEach(exp => {
        const splitAmount = exp.amount / members.length;
        members.forEach(member => {
            balances[member] += member === exp.paidBy ? exp.amount - splitAmount : -splitAmount;
        });
    });
    return balances;
}

// Balance Summary
function updateBalanceSummary() {
    const balances = getBalances();
    balanceDetails.innerHTML = '';
    for (let member in balances) {
        const balanceItem = document.createElement('div');
        balanceItem.className = 'balance-item';
        const balance = balances[member];
        balanceItem.innerHTML = `${member}: <span style="color:${balance >=0 ? 'green':'red'}">₹${Math.abs(balance.toFixed(2))}</span>`;
        balanceDetails.appendChild(balanceItem);
    }
}

// Populate PaidBy Select
function populatePaidBySelect() {
    paidBySelect.innerHTML = '';
    currentGroup.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        paidBySelect.appendChild(option);
    });
}

// Add Expense
function addExpense(description, amount, paidBy) {
    const expense = {
        id: Date.now(),
        groupId: currentGroup.id,
        description,
        amount: parseFloat(amount),
        paidBy
    };
    appData.expenses.push(expense);
    saveData();
    renderExpenses();
    updateBalanceSummary();
}

// Delete Expense
function deleteExpense(expenseId) {
    appData.expenses = appData.expenses.filter(e => e.id !== expenseId);
    saveData();
    renderExpenses();
    updateBalanceSummary();
}

// Edit Group
function editGroup(groupId, name, members) {
    const group = appData.groups.find(g => g.id === groupId);
    if (group) {
        const oldMembers = group.members;
        const newMembers = members;
        const removedMembers = oldMembers.filter(m => !newMembers.includes(m));

        if (removedMembers.length > 0) {
            appData.expenses = appData.expenses.filter(e => 
                e.groupId !== groupId || !removedMembers.includes(e.paidBy)
            );
        }

        group.name = name;
        group.members = newMembers;
        saveData();
        groupNameHeader.textContent = name;
        renderGroupList();
        populatePaidBySelect();
        updateBalanceSummary();
        renderExpenses();
    }
}

// Delete Group
function confirmDeleteGroup(groupId) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal-overlay';
    confirmModal.innerHTML = `<div class="modal">
        <div class="modal-header">
            <h2>Delete Group</h2>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete this group? All its expenses will also be removed.</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelDeleteGroup">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteGroupBtn">Delete</button>
        </div>
    </div>`;
    document.body.appendChild(confirmModal);
    confirmModal.style.display = 'flex';

    confirmModal.querySelector('#cancelDeleteGroup').addEventListener('click', () => confirmModal.remove());
    confirmModal.querySelector('#confirmDeleteGroupBtn').addEventListener('click', () => {
        appData.groups = appData.groups.filter(g => g.id !== groupId);
        appData.expenses = appData.expenses.filter(e => e.groupId !== groupId);
        saveData();
        confirmModal.remove();
        renderGroupList();
        showDashboard();
    });
}

// Save Data
function saveData() {
    localStorage.setItem('appData', JSON.stringify(appData));
}

// Show Custom Modal for Alerts
function showCustomModal(title, message) {
    console.log('Showing custom modal:', { title, message });
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" id="closeCustomModal">×</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="closeCustomModalBtn">OK</button>
            </div>
        </div>
    `;
    try {
        document.body.appendChild(modal);
        const closeButtons = modal.querySelectorAll('#closeCustomModal, #closeCustomModalBtn');
        if (closeButtons.length === 0) {
            console.error('No close buttons found in modal');
        }
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Closing modal');
                modal.remove();
            });
        });
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error displaying custom modal:', error);
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    showDashboard();
});

createGroupFab.addEventListener('click', () => createGroupModal.style.display = 'flex');
closeCreateGroupModal.addEventListener('click', () => createGroupModal.style.display = 'none');
cancelCreateGroup.addEventListener('click', () => createGroupModal.style.display = 'none');

saveGroup.addEventListener('click', () => {
    const name = groupNameInput.value.trim();
    let members = groupMembersInput.value.split(',').map(m => m.trim()).filter(Boolean);
    if (!name || members.length === 0) {
        showCustomModal('Invalid Input', 'Group name and members are required.');
        return;
    }
    const group = { id: Date.now(), name, members };
    appData.groups.push(group);
    saveData();
    createGroupModal.style.display = 'none';
    groupNameInput.value = '';
    groupMembersInput.value = '';
    renderGroupList();
});

editGroupBtn.addEventListener('click', () => {
    editGroupNameInput.value = currentGroup.name;
    editGroupMembersInput.value = currentGroup.members.join(', ');
    editGroupModal.style.display = 'flex';
});

closeEditGroupModal.addEventListener('click', () => editGroupModal.style.display = 'none');
cancelEditGroup.addEventListener('click', () => editGroupModal.style.display = 'none');

saveEditGroup.addEventListener('click', () => {
    const name = editGroupNameInput.value.trim();
    let members = editGroupMembersInput.value.split(',').map(m => m.trim()).filter(Boolean);
    if (!name || members.length === 0) {
        showCustomModal('Invalid Input', 'Group name and members are required.');
        return;
    }
    editGroup(currentGroup.id, name, members);
    editGroupModal.style.display = 'none';
    editGroupNameInput.value = '';
    editGroupMembersInput.value = '';
});

backBtn.addEventListener('click', () => showDashboard());

addExpenseBtn.addEventListener('click', () => addExpenseModal.style.display = 'flex');
closeAddExpenseModal.addEventListener('click', () => addExpenseModal.style.display = 'none');
cancelAddExpense.addEventListener('click', () => addExpenseModal.style.display = 'none');

saveExpense.addEventListener('click', () => {
    const desc = expenseDescription.value.trim();
    const amt = expenseAmount.value;
    const paidBy = paidBySelect.value;
    if (!desc || !amt || !paidBy) {
        showCustomModal('Invalid Input', 'Please fill all fields.');
        return;
    }
    addExpense(desc, amt, paidBy);
    expenseDescription.value = '';
    expenseAmount.value = '';
    addExpenseModal.style.display = 'none';
});

// AI Modal Functionality
aiBtn.addEventListener('click', () => {
    aiOptionsModal.style.display = 'flex';
    aiOptionsModal.querySelector('.modal-body').innerHTML = `
        <div class="ai-options">
            <div class="ai-option" data-action="summary">Show Summary</div>
            <div class="ai-option" data-action="owesMost">Who owes most?</div>
            <div class="ai-option" data-action="owedMost">Who owed most?</div>
            <div class="ai-option" data-action="simplify">Simplify balances</div>
            <div class="ai-option" data-action="largestExpense">Largest expense</div>
        </div>`;
    const aiOptionElements = aiOptionsModal.querySelectorAll('.ai-option');
    aiOptionElements.forEach(option => {
        option.addEventListener('click', () => handleAIOption(option.getAttribute('data-action')));
    });
});

closeAiModal.addEventListener('click', () => aiOptionsModal.style.display = 'none');

// AI Option Handler
function handleAIOption(action) {
    const modalBody = aiOptionsModal.querySelector('.modal-body');
    let contentHTML = '';
    const groupExpenses = appData.expenses.filter(e => e.groupId === currentGroup.id);
    const balances = getBalances();

    if (action === 'summary') {
        const total = groupExpenses.reduce((acc, e) => acc + e.amount, 0);
        contentHTML = `<div class="ai-message-box">Total expenses in ${currentGroup.name}: ₹${total.toFixed(2)}</div>`;
    } else if (action === 'owesMost') {
        const balValues = Object.values(balances);
        const minBal = balValues.length > 0 ? Math.min(...balValues) : 0;
        if (minBal >= 0) {
            contentHTML = `<div class="ai-message-box">No one owes money.</div>`;
        } else {
            const owesMostMembers = Object.entries(balances).filter(([, b]) => b === minBal).map(([m]) => m);
            const verb = owesMostMembers.length > 1 ? 'owe' : 'owes';
            contentHTML = `<div class="ai-message-box">${owesMostMembers.join(', ')} ${verb} the most: ₹${Math.abs(minBal.toFixed(2))}</div>`;
        }
    } else if (action === 'owedMost') {
        const balValues = Object.values(balances);
        const maxBal = balValues.length > 0 ? Math.max(...balValues) : 0;
        if (maxBal <= 0) {
            contentHTML = `<div class="ai-message-box">No one is owed money.</div>`;
        } else {
            const owedMostMembers = Object.entries(balances).filter(([, b]) => b === maxBal).map(([m]) => m);
            const verb = owedMostMembers.length > 1 ? 'are' : 'is';
            contentHTML = `<div class="ai-message-box">${owedMostMembers.join(', ')} ${verb} owed the most: ₹${maxBal.toFixed(2)}</div>`;
        }
    } else if (action === 'simplify') {
        const transactions = simplifyBalances(balances);
        if (transactions.length === 0) {
            contentHTML = `<div class="ai-message-box">Balances are already settled.</div>`;
        } else {
            contentHTML = `<div class="ai-message-box"><h3>Settlement Transactions:</h3>${transactions.map(t => `<p>${t}</p>`).join('')}</div>`;
        }
    } else if (action === 'largestExpense') {
        if (groupExpenses.length === 0) {
            contentHTML = `<div class="ai-message-box">No expenses yet.</div>`;
        } else {
            const amounts = groupExpenses.map(e => e.amount);
            const maxAmount = Math.max(...amounts);
            const largestExpenses = groupExpenses.filter(e => e.amount === maxAmount);
            const plural = largestExpenses.length > 1 ? 's' : '';
            contentHTML = `<div class="ai-message-box">Largest expense${plural}:<br>${largestExpenses.map(e => `${e.description} of ₹${e.amount} paid by ${e.paidBy}`).join('<br>')}</div>`;
        }
    }

    modalBody.innerHTML = contentHTML;
}

// Simplify Balances
function simplifyBalances(balances) {
    let debtors = [];
    let creditors = [];
    for (let member in balances) {
        let bal = balances[member];
        if (bal < 0) debtors.push({ name: member, amount: -bal });
        else if (bal > 0) creditors.push({ name: member, amount: bal });
    }
    let transactions = [];
    while (debtors.length > 0 && creditors.length > 0) {
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);
        let deb = debtors[0];
        let cred = creditors[0];
        let amt = Math.min(deb.amount, cred.amount);
        if (amt > 0) {
            transactions.push(`${deb.name} pays ${cred.name} ₹${amt.toFixed(2)}`);
        }
        deb.amount -= amt;
        cred.amount -= amt;
        if (deb.amount <= 0) debtors.shift();
        if (cred.amount <= 0) creditors.shift();
    }
    return transactions;
}

// Initialize the app
initApp();