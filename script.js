document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const classButtons = document.querySelectorAll('.class-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const downloadBtn = document.getElementById('download-btn');
    const scoreTable = document.getElementById('score-table').getElementsByTagName('tbody')[0];
    const modal = document.getElementById('scoring-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const archerNameSpan = document.getElementById('archer-name');
    const sessionTabs = document.querySelectorAll('.session-tab');
    const scoringTable = document.getElementById('scoring-table').getElementsByTagName('tbody')[0];
    const saveScoresBtn = document.getElementById('save-scores');

    let currentTab = 'recurve';
    let currentClass = 'SD/MI Kelas 4-6 - 40m';
    let currentCategory = 'Individu Putra';
    let currentSession = 1;
    let currentArcherIndex = -1;

    let sampleData = [
        { id: '1A', rank: 1, name: 'M. Lutfi Al Farisi', club: 'Kebumen Archery', total: 0, sessions: [{}, {}] },
        { id: '2A', rank: 3, name: 'Maulana Malik Ibrahim', club: 'Kebumen Archery', total: 0, sessions: [{}, {}] },
        { id: '3A', rank: 2, name: 'Junior Meyza Adnan Asyhab', club: 'Kebumen POPDA Kebumen', total: 0, sessions: [{}, {}] },
    ];

    function updateMainTable() {
        scoreTable.innerHTML = '';
        sampleData.forEach((archer, index) => {
            const row = scoreTable.insertRow();
            row.innerHTML = `
                <td>${archer.id}</td>
                <td>${archer.rank}</td>
                <td>${archer.name}</td>
                <td>${archer.club}</td>
                <td>${archer.total}</td>
                <td><button class="edit-btn" data-index="${index}">Edit</button></td>
            `;
        });
        addEditListeners();
    }

    function addEditListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentArcherIndex = e.target.dataset.index;
                openScoringModal(currentArcherIndex);
            });
        });
    }

    function openScoringModal(index) {
        const archer = sampleData[index];
        archerNameSpan.textContent = archer.name;
        updateScoringTable();
        modal.style.display = 'block';
    }

    function updateScoringTable() {
        const archer = sampleData[currentArcherIndex];
        const session = archer.sessions[currentSession - 1];
        scoringTable.innerHTML = '';

        for (let end = 1; end <= 6; end++) {
            const row = scoringTable.insertRow();
            row.innerHTML = `
                <td>${end}</td>
                ${Array(6).fill().map((_, i) => `
                    <td>
                        <input type="text" data-end="${end}" data-shot="${i + 1}" maxlength="2" class="score-input">
                    </td>
                `).join('')}
                <td class="end-total">0</td>
            `;
        }

        // Set values if they exist
        if (session.ends) {
            session.ends.forEach((end, endIndex) => {
                end.forEach((shot, shotIndex) => {
                    const input = scoringTable.querySelector(`input[data-end="${endIndex + 1}"][data-shot="${shotIndex + 1}"]`);
                    input.value = shot;
                });
            });
        }

        addInputListeners();
        updateTotals();
    }

    function addInputListeners() {
        const inputs = scoringTable.querySelectorAll('.score-input');
        inputs.forEach(input => {
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
        });
    }

    function handleInput(event) {
        const input = event.target;
        const value = input.value.toUpperCase();

        if (value === '1') {
            showOptions(input);
        } else if (['0', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'M'].includes(value)) {
            input.value = value;
            moveToNextInput(input);
        } else if (value === '10') {
            input.value = '10';
            moveToNextInput(input);
        } else {
            input.value = '';
        }

        updateTotals();
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            moveToNextInput(event.target);
        }
    }

    function showOptions(input) {
        const options = ['1', '10'];
        const select = document.createElement('select');
        select.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        select.style.width = input.offsetWidth + 'px';
        select.style.height = input.offsetHeight + 'px';

        select.addEventListener('change', () => {
            input.value = select.value;
            input.style.display = 'inline-block';
            select.remove();
            moveToNextInput(input);
            updateTotals();
        });

        input.style.display = 'none';
        input.parentNode.insertBefore(select, input);
        select.focus();
    }

    function moveToNextInput(currentInput) {
        const inputs = Array.from(scoringTable.querySelectorAll('.score-input'));
        const currentIndex = inputs.indexOf(currentInput);
        const nextInput = inputs[currentIndex + 1];

        if (nextInput) {
            nextInput.focus();
        } else {
            // If it's the last input, you might want to focus on a "Save" button or do nothing
            // For now, we'll focus on the first input of the table
            inputs[0].focus();
        }
    }

    function updateTotals() {
        const archer = sampleData[currentArcherIndex];
        const session = archer.sessions[currentSession - 1];
        let sessionTotal = 0;
        let xPlusTen = 0;
        let xCount = 0;

        session.ends = [];

        for (let end = 1; end <= 6; end++) {
            let endTotal = 0;
            const endScores = [];

            for (let shot = 1; shot <= 6; shot++) {
                const input = scoringTable.querySelector(`input[data-end="${end}"][data-shot="${shot}"]`);
                const value = input.value.toUpperCase();
                endScores.push(value);

                if (value === 'X') {
                    endTotal += 10;
                    xPlusTen++;
                    xCount++;
                } else if (value !== '-' && value !== 'M') {
                    const score = parseInt(value);
                    endTotal += score;
                    if (score === 10) xPlusTen++;
                }
            }

            session.ends.push(endScores);
            sessionTotal += endTotal;
            scoringTable.querySelector(`tr:nth-child(${end}) .end-total`).textContent = endTotal;
        }

        document.getElementById('x-plus-10').textContent = xPlusTen;
        document.getElementById('x-count').textContent = xCount;
        document.getElementById('session-total').textContent = sessionTotal;

        const otherSessionTotal = archer.sessions[currentSession === 1 ? 1 : 0].total || 0;
        const totalAccumulation = sessionTotal + otherSessionTotal;
        document.getElementById('total-accumulation').textContent = totalAccumulation;

        session.total = sessionTotal;
        session.xPlusTen = xPlusTen;
        session.xCount = xCount;
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMainTable();
        });
    });

    classButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            classButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentClass = btn.dataset.class;
            updateMainTable();
        });
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            updateMainTable();
        });
    });

    sessionTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            sessionTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSession = parseInt(btn.dataset.session);
            updateScoringTable();
        });
    });

    downloadBtn.addEventListener('click', () => {
        alert('Downloading scoresheet...');
        // Implement actual download functionality here
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    saveScoresBtn.addEventListener('click', () => {
        const archer = sampleData[currentArcherIndex];
        archer.total = archer.sessions[0].total + archer.sessions[1].total;
        updateMainTable();
        modal.style.display = 'none';
    });

    // Call updateMainTable() when the page loads
    updateMainTable();
});