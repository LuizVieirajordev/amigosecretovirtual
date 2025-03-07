// Array para armazenar os participantes
let participants = [];
// Objeto para armazenar o resultado do sorteio
let sortResult = {};
// Flag para verificar se o sorteio já foi realizado
let sortDone = false;

// Elementos do DOM
const nameInput = document.getElementById('nameInput');
const cpfInput = document.getElementById('cpfInput');
const addBtn = document.getElementById('addBtn');
const participantsList = document.getElementById('participantsList');
const sortBtn = document.getElementById('sortBtn');
const resultsSection = document.getElementById('resultsSection');
const cardsContainer = document.getElementById('cardsContainer');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const cpfVerification = document.getElementById('cpfVerification');
const cpfVerify = document.getElementById('cpfVerify');
const checkCpfBtn = document.getElementById('checkCpfBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resultContainer = document.getElementById('resultContainer');
const friendName = document.getElementById('friendName');
const closeResultBtn = document.getElementById('closeResultBtn');
const statusMessage = document.getElementById('statusMessage');

// Função para adicionar um participante
addBtn.addEventListener('click', function() {
    // Obter valores dos inputs
    const name = nameInput.value.trim();
    const cpf = cpfInput.value.trim();
    
    // Validar inputs
    if (name === '' || cpf === '') {
        showStatusMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    // Validar formato do CPF (apenas números)
    if (!/^\d+$/.test(cpf)) {
        showStatusMessage('CPF deve conter apenas números.', 'error');
        return;
    }
    
    // Verificar se o nome já existe
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showStatusMessage('Este nome já foi adicionado.', 'error');
        return;
    }
    
    // Verificar se o CPF já existe
    if (participants.some(p => p.cpf === cpf)) {
        showStatusMessage('Este CPF já foi cadastrado.', 'error');
        return;
    }
    
    // Adicionar participante ao array
    participants.push({
        name: name,
        cpf: cpf
    });
    
    // Atualizar a lista na interface
    updateParticipantsList();
    
    // Limpar os campos de input
    nameInput.value = '';
    cpfInput.value = '';
    
    // Mostrar mensagem de sucesso
    showStatusMessage(`${name} adicionado com sucesso!`, 'success');
});

// Função para atualizar a lista de participantes na interface
function updateParticipantsList() {
    // Limpar a lista atual
    participantsList.innerHTML = '';
    
    // Adicionar cada participante à lista
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        li.className = 'participant-item';
        li.innerHTML = `
            <span class="participant-name">${participant.name}</span>
            <button class="remove-btn" data-index="${index}">Remover</button>
        `;
        participantsList.appendChild(li);
    });
    
    // Atualizar estado do botão de sorteio
    sortBtn.disabled = participants.length < 2;
}

// Função para remover um participante
participantsList.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const removedName = participants[index].name;
        participants.splice(index, 1);
        updateParticipantsList();
        showStatusMessage(`${removedName} removido com sucesso!`, 'success');
    }
});

// Função para realizar o sorteio
sortBtn.addEventListener('click', function() {
    // Verificar se há participantes suficientes
    if (participants.length < 2) {
        showStatusMessage('É necessário pelo menos 2 participantes para realizar o sorteio.', 'error');
        return;
    }
    
    // Se o sorteio já foi realizado, perguntar se deseja realizar um novo
    if (sortDone) {
        if (!confirm('Já existe um sorteio realizado. Deseja realizar um novo sorteio?')) {
            return;
        }
    }
    
    // Realizar o sorteio
    doSort();
    
    // Exibir a seção de resultados
    resultsSection.classList.remove('hidden');
    sortBtn.textContent = 'Realizar Novo Sorteio';
    sortBtn.classList.add('sort-animation');
    showStatusMessage('Sorteio realizado com sucesso!', 'success');
    
    // Atualizar flag
    sortDone = true;
    
    // Rolar para a seção de resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Remover a animação após um tempo
    setTimeout(() => {
        sortBtn.classList.remove('sort-animation');
    }, 1000);
});

// Função para realizar o sorteio aleatório
function doSort() {
    // Clonar array de participantes
    let receivers = [...participants];
    sortResult = {};
    
    // Para cada participante, sortear um amigo secreto
    for (let i = 0; i < participants.length; i++) {
        let sender = participants[i];
        let receiversFiltered = receivers.filter(r => r.name !== sender.name);
        
        // Se não há opções válidas, reiniciar o sorteio
        if (receiversFiltered.length === 0) {
            return doSort(); // Tentar novamente
        }
        
        // Sortear um receptor aleatório
        const randomIndex = Math.floor(Math.random() * receiversFiltered.length);
        const receiver = receiversFiltered[randomIndex];
        
        // Guardar o resultado
        sortResult[sender.name] = receiver.name;
        
        // Remover o receptor sorteado da lista de disponíveis
        receivers = receivers.filter(r => r.name !== receiver.name);
    }
    
    // Atualizar os cards na interface
    updateResultCards();
}

// Função para atualizar os cards de resultado na interface
function updateResultCards() {
    cardsContainer.innerHTML = '';
    
    participants.forEach(participant => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.dataset.name = participant.name;
        card.innerHTML = `
            <h3>${participant.name}</h3>
            <div class="lock-icon">🔒</div>
            <p>Clique para ver seu amigo secreto</p>
        `;
        cardsContainer.appendChild(card);
        
        // Adicionar evento de clique
        card.addEventListener('click', function() {
            openModal(participant.name);
        });
    });
}

// Função para abrir o modal de verificação
function openModal(participantName) {
    modalTitle.textContent = `Olá, ${participantName}!`;
    cpfVerification.style.display = 'block';
    resultContainer.classList.remove('show');
    modal.classList.add('show');
    
    // Guardar o nome do participante atual no botão de verificação
    checkCpfBtn.dataset.participant = participantName;
    
    // Limpar o campo de CPF
    cpfVerify.value = '';
    cpfVerify.focus();
}

// Função para verificar o CPF e mostrar o resultado
checkCpfBtn.addEventListener('click', function() {
    const participantName = checkCpfBtn.dataset.participant;
    const cpfEntered = cpfVerify.value.trim();
    
    // Encontrar o participante pelo nome
    const participant = participants.find(p => p.name === participantName);
    
    // Verificar se o CPF está correto
    if (participant && participant.cpf === cpfEntered) {
        // Mostrar o resultado
        const friendNameValue = sortResult[participantName];
        friendName.textContent = friendNameValue;
        
        // Esconder a verificação e mostrar o resultado
        cpfVerification.style.display = 'none';
        resultContainer.classList.add('show');
    } else {
        alert('CPF incorreto. Tente novamente.');
    }
});

// Fechar o modal
cancelBtn.addEventListener('click', function() {
    modal.classList.remove('show');
});

closeResultBtn.addEventListener('click', function() {
    modal.classList.remove('show');
});

// Clicar fora do modal para fechá-lo
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Função para mostrar mensagem de status
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(`status-${type}`);
    
    // Esconder a mensagem após alguns segundos
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}

// Inicializar o estado do botão de sorteio
sortBtn.disabled = true;
