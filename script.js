// *** SEU OBJETO firebaseConfig AQUI ***
// COLOQUE A CONFIGURAÇÃO QUE VOCÊ COPICOU DO CONSOLE DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "AIzaSyA3OW3Pl2SdnW-jkJrChGSJdXINXovcUDk",
  authDomain: "listafilmes-22e49.firebaseapp.com",
  projectId: "listafilmes-22e49",
  storageBucket: "listafilmes-22e49.firebasestorage.app",
  messagingSenderId: "909382259172",
  appId: "1:909382259172:web:fec8f06511f76d9138f7f1"
};
// *** FIM DA CONFIGURAÇÃO DO FIREBASE ***

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
// Obtenha uma referência ao Firestore
const db = firebase.firestore();
const mediaCollection = db.collection('mediaList'); // O nome da sua coleção no Firestore
let currentFilter = 'todos';

document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('filterSelect');
    const mediaTableBody = document.querySelector('#mediaTable tbody');
    const mediaGridDiv = document.getElementById('mediaGrid');
    const displayContainer = document.getElementById('displayContainer');
    const randomBtn = document.getElementById('randomBtn');
    const randomResult = document.getElementById('randomResult');
    const clearListBtn = document.getElementById('clearListBtn');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const toggleAddFormBtn = document.getElementById('toggleAddFormBtn');
    const addMediaSection = document.getElementById('addMediaSection');

    const manualTitleInput = document.getElementById('manualTitleInput');
    const manualTypeInput = document.getElementById('manualTypeInput');
    const manualPosterInput = document.getElementById('manualPosterInput');
    const addCustomEntryBtn = document.getElementById('addCustomEntryBtn');

    let currentViewMode = localStorage.getItem('viewMode') || 'list';

    // --- Funções de Visualização ---

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        // re-renderiza com os dados do snapshot atual
        mediaCollection.orderBy('createdAt', 'asc').get().then(snapshot => {
            renderMedia(snapshot.docs);
        });
    });

    function setInitialView() {
        displayContainer.classList.remove('list-view', 'grid-view');
        displayContainer.classList.add(currentViewMode + '-view');
        toggleViewBtn.textContent = `Alternar Visualização (${currentViewMode === 'list' ? 'Grade' : 'Lista'})`;
    }

    function toggleAddForm() {
        if (addMediaSection.style.display === 'none' || addMediaSection.style.display === '') {
            addMediaSection.style.display = 'block';
            toggleAddFormBtn.textContent = 'Fechar Formulário';
        } else {
            addMediaSection.style.display = 'none';
            toggleAddFormBtn.textContent = 'Adicionar Novo Filme/Série';
            manualTitleInput.value = '';
            manualPosterInput.value = '';
            manualTypeInput.value = 'Filme';
        }
    }

    // FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO
    // Agora ela recebe os dados diretamente do Firestore
    function renderMedia(docs) {
        mediaTableBody.innerHTML = '';
        mediaGridDiv.innerHTML = '';

        let mediaListFromFirestore = [];
        docs.forEach(doc => {
            mediaListFromFirestore.push({ id: doc.id, ...doc.data() });
        });

        // Aplica o filtro
        if (currentFilter === 'assistido') {
            mediaListFromFirestore = mediaListFromFirestore.filter(m => m.watched);
        } else if (currentFilter === 'nao-assistido') {
            mediaListFromFirestore = mediaListFromFirestore.filter(m => !m.watched);
        }


        if (mediaListFromFirestore.length === 0) {
            const message = "Nenhum filme ou série na lista. Adicione um acima!";
            
            const tableRow = mediaTableBody.insertRow();
            const tableCell = tableRow.insertCell(0);
            tableCell.colSpan = 5;
            tableCell.textContent = message;
            tableCell.style.textAlign = 'center';
            tableCell.fontStyle = 'italic';
            tableCell.padding = '20px';
            tableCell.color = 'var(--text-color)';
            
            const gridMessageDiv = document.createElement('div');
            gridMessageDiv.textContent = message;
            gridMessageDiv.style.textAlign = 'center';
            gridMessageDiv.style.fontStyle = 'italic';
            gridMessageDiv.style.padding = '20px';
            gridMessageDiv.style.color = 'var(--text-color)';
            mediaGridDiv.appendChild(gridMessageDiv);

        } else {
            mediaListFromFirestore.forEach((media, index) => {
                // Renderiza item na Tabela
                const tableRow = mediaTableBody.insertRow();
                tableRow.classList.toggle('watched', media.watched);

                const posterCell = tableRow.insertCell();
                const titleCell = tableRow.insertCell();
                const typeCell = tableRow.insertCell();
                const watchedCell = tableRow.insertCell();
                const actionsCell = tableRow.insertCell();
                actionsCell.classList.add('actions');

                const tableImg = document.createElement('img');
                tableImg.alt = `Poster de ${media.title}`;
                tableImg.classList.add('poster-img');
                tableImg.onerror = () => { tableImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster'; }; 
                if (media.poster && media.poster !== 'N/A' && isValidHttpUrl(media.poster)) {
                    tableImg.src = media.poster;
                } else {
                    tableImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster';
                }
                posterCell.appendChild(tableImg);

                titleCell.textContent = media.title;
                typeCell.textContent = media.type;
                watchedCell.textContent = media.watched ? 'Sim' : 'Não';

                const markWatchedBtnTable = document.createElement('button');
                markWatchedBtnTable.textContent = media.watched ? 'Desmarcar' : 'Assistido';
                markWatchedBtnTable.classList.add('mark-watched-btn');
                // Usa media.id para identificar no Firestore
                markWatchedBtnTable.addEventListener('click', () => toggleWatched(media.id, media.watched));
                actionsCell.appendChild(markWatchedBtnTable);

                const removeBtnTable = document.createElement('button');
                removeBtnTable.textContent = 'Remover';
                removeBtnTable.classList.add('remove-btn');
                // Usa media.id para identificar no Firestore
                removeBtnTable.addEventListener('click', () => removeEntry(media.id));
                actionsCell.appendChild(removeBtnTable);


                // Renderiza item na Grade (Grid)
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.classList.toggle('watched', media.watched);

                const posterContainer = document.createElement('div');
                posterContainer.classList.add('poster-container');
                const gridImg = document.createElement('img');
                gridImg.alt = `Poster de ${media.title}`;
                gridImg.classList.add('poster-img');
                gridImg.onerror = () => { gridImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster'; };
                if (media.poster && media.poster !== 'N/A' && isValidHttpUrl(media.poster)) {
                    gridImg.src = media.poster;
                } else {
                    gridImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster';
                }
                posterContainer.appendChild(gridImg);
                gridItem.appendChild(posterContainer);

                const itemDetails = document.createElement('div');
                itemDetails.classList.add('item-details');
                
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                titleDiv.textContent = media.title;
                itemDetails.appendChild(titleDiv);

                const typeDiv = document.createElement('div');
                typeDiv.classList.add('type');
                typeDiv.textContent = media.type;
                itemDetails.appendChild(typeDiv);
                
                const actionsGrid = document.createElement('div');
                actionsGrid.classList.add('actions');

                const markWatchedBtnGrid = document.createElement('button');
                markWatchedBtnGrid.textContent = media.watched ? 'Desmarcar' : 'Assistido';
                markWatchedBtnGrid.classList.add('mark-watched-btn');
                // Usa media.id para identificar no Firestore
                markWatchedBtnGrid.addEventListener('click', () => toggleWatched(media.id, media.watched));
                actionsGrid.appendChild(markWatchedBtnGrid);

                const removeBtnGrid = document.createElement('button');
                removeBtnGrid.textContent = 'Remover';
                removeBtnGrid.classList.add('remove-btn');
                // Usa media.id para identificar no Firestore
                removeBtnGrid.addEventListener('click', () => removeEntry(media.id));
                actionsGrid.appendChild(removeBtnGrid);

                itemDetails.appendChild(actionsGrid);
                gridItem.appendChild(itemDetails);
                mediaGridDiv.appendChild(gridItem);
            });
        }
    }

    function isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    // MÉTODOS FIREBASE: toggleWatched, removeEntry, addCustomEntry, clearList
    // AGORA INTERAGEM DIRETAMENTE COM O FIRESTORE

    async function toggleWatched(id, currentWatchedStatus) {
        try {
            await mediaCollection.doc(id).update({
                watched: !currentWatchedStatus
            });
            // Firestore listener cuidará da re-renderização
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao atualizar o status. Verifique as regras do Firebase.");
        }
    }

    async function removeEntry(id) {
        if (confirm('Tem certeza que deseja remover esta entrada?')) {
            try {
                await mediaCollection.doc(id).delete();
                // Firestore listener cuidará da re-renderização
            } catch (error) {
                console.error("Erro ao remover:", error);
                alert("Erro ao remover a entrada. Verifique as regras do Firebase.");
            }
        }
    }

    async function addCustomEntry() {
        const title = manualTitleInput.value.trim();
        const type = manualTypeInput.value;
        const poster = manualPosterInput.value.trim();

        if (!title) {
            alert('O título é obrigatório para adicionar um filme/série.');
            return;
        }

        const newMedia = {
            title: title,
            type: type,
            poster: poster || 'https://via.placeholder.com/60x90?text=Sem+Poster', // Placeholder padrão
            watched: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // Para ordenar, opcional
        };

        try {
            await mediaCollection.add(newMedia);
            // Firestore listener cuidará da re-renderização
            manualTitleInput.value = '';
            manualPosterInput.value = '';
            manualTypeInput.value = 'Filme';
        } catch (error) {
            console.error("Erro ao adicionar:", error);
            alert("Erro ao adicionar o filme/série. Verifique as regras do Firebase.");
        }
    }
    
    async function chooseRandomUnwatched() {
        // Puxa todos os documentos para filtrar localmente
        try {
            const snapshot = await mediaCollection.where('watched', '==', false).get();
            const unwatchedMedia = [];
            snapshot.forEach(doc => {
                unwatchedMedia.push({ id: doc.id, ...doc.data() });
            });

            if (unwatchedMedia.length > 0) {
                const randomIndex = Math.floor(Math.random() * unwatchedMedia.length);
                const chosenMedia = unwatchedMedia[randomIndex];
                randomResult.textContent = `Que tal assistir: ${chosenMedia.title} (${chosenMedia.type})?`;
                randomResult.style.display = 'block';
            } else {
                randomResult.textContent = 'Não há filmes ou séries não assistidos na lista!';
                randomResult.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao escolher aleatório:", error);
            alert("Erro ao buscar filmes não assistidos. Verifique as regras do Firebase.");
        }
    }

    // CUIDADO: Limpar todos os documentos pode ser lento e custoso
    // para grandes coleções se feito no cliente.
    async function clearList() {
        if (confirm('Tem certeza que deseja limpar TODA a sua lista? Esta ação não pode ser desfeita.')) {
            try {
                const snapshot = await mediaCollection.get();
                const batch = db.batch(); // Usar batch para deleções eficientes

                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                randomResult.style.display = 'none';
                alert('Sua lista foi limpa com sucesso!');
                // Firestore listener cuidará da re-renderização
            } catch (error) {
                console.error("Erro ao limpar lista:", error);
                alert("Erro ao limpar a lista. Verifique as regras do Firebase.");
            }
        }
    }

    function toggleView() {
        if (currentViewMode === 'list') {
            currentViewMode = 'grid';
            toggleViewBtn.textContent = 'Alternar Visualização (Lista)';
        } else {
            currentViewMode = 'list';
            toggleViewBtn.textContent = 'Alternar Visualização (Grade)';
        }
        localStorage.setItem('viewMode', currentViewMode);
        setInitialView();
    }
    

    // --- Event Listeners ---
    addCustomEntryBtn.addEventListener('click', addCustomEntry);
    randomBtn.addEventListener('click', chooseRandomUnwatched);
    clearListBtn.addEventListener('click', clearList);
    toggleViewBtn.addEventListener('click', toggleView);
    toggleAddFormBtn.addEventListener('click', toggleAddForm);

    // --- Firestore Realtime Listener ---
    // Esta é a parte mágica que mantém sua UI sincronizada com o banco de dados
    mediaCollection.orderBy('createdAt', 'asc').onSnapshot((snapshot) => {
        // Sempre que houver uma mudança na coleção (add, update, delete),
        // esta função será chamada e a UI será atualizada automaticamente.
        renderMedia(snapshot.docs);
    }, (error) => {
        console.error("Erro ao obter dados do Firestore:", error);
        alert("Erro ao carregar a lista do banco de dados. Verifique sua conexão e as regras do Firebase Firestore.");
    });


    // --- Inicialização ---
    setInitialView();
    // Forçar modo grade no mobile
    if (window.innerWidth <= 768) {
        currentViewMode = 'grid';
        setInitialView();
    }

 // Define a visualização inicial (lista ou grid)
    // renderMedia() será chamada pelo listener do Firestore na primeira carga
});
