/**
 * Etape 1
 * Changer le nom de la collection pour créer un nouveau jeu
 */
const GAME_COLLECTION_NAME = 'application_micro-folie';
/**
 * Etape 2
 * Editer la taille du jeu
 */
const LARGEUR_DU_JEU = 2500;
const HAUTEUR_DU_JEU = 1100;
/**
 * Etape 3
 * Editer la configuration de Firebase si besoin
 */
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyAET9nyNsU_kTbuG5jMFFJxAn3S2XuXU2o",
//     authDomain: "pixel-war-esd-thomas.firebaseapp.com",
//     projectId: "pixel-war-esd-thomas",
//     storageBucket: "pixel-war-esd-thomas.appspot.com",
//     messagingSenderId: "735644169756",
//     appId: "1:735644169756:web:7c80c4445272d1545a51d9"
//   };
const firebaseConfig = {
    apiKey: "AIzaSyByUEIRbEMybz8xviKN_XUWEFZI_AvELVw",
    authDomain: "micro-folie.firebaseapp.com",
    projectId: "micro-folie",
    storageBucket: "micro-folie.firebasestorage.app",
    messagingSenderId: "788334935160",
    appId: "1:788334935160:web:e796bbc6b276dc8166c18d",
    measurementId: "G-WKQ38R255L"
  };

/*********************/
/**
 * Game code
 */
/*********************/
const colorsChoice = document.querySelector('#colorsChoice');
const game = document.querySelector('#game');
const cursor = document.querySelector('#cursor');
game.width = LARGEUR_DU_JEU;
game.height = HAUTEUR_DU_JEU;
const gridCellSize = 10
let pixelSize = 1;
const ctx = game.getContext('2d');
const gridCtx = game.getContext('2d');
const colorList = [
    "#8C8FAE", "#584563", "#3E2137", "#9A6348", "#D79B7D", "#F5EDBA",
    "#C0C741", "#647D34", "#E4943A", "#9D303B", "#D26471", "#70377F", "#7EC4C1", "#34859D",
    "#17434B", "#1F0E1C","#FFFFFF", "#FFFF00"
];
let currentColorChoice = colorList[9];

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

colorList.forEach((color, index) => {
    const colorItem = document.createElement('div');
    colorItem.style.backgroundColor = color;
    colorsChoice.appendChild(colorItem);

    colorItem.addEventListener('click', () => {
        currentColorChoice = color;

        colorItem.innerHTML = '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {
            colorItem.innerHTML = "";
        }, 1000);
    });
});

function createPixel(x, y, color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridCellSize, gridCellSize);
}

function addMultiPixelIntoGame(){
    const x = cursor.offsetLeft;
    const y = cursor.offsetTop - game.offsetTop;

    for(let i = 0; i < pixelSize; i++) {
        for(let j = 0; j < pixelSize; j++) {
            const newX = x + i*gridCellSize;
            const newY = y + j*gridCellSize;

            // Remove existing pixel
            const oldPixelRef = db.collection(GAME_COLLECTION_NAME).doc(`${newX}-${newY}`);
            oldPixelRef.get().then((docSnapshot) => {
                if (docSnapshot.exists) oldPixelRef.delete();
                    
                createPixel(x + i*gridCellSize, y + j*gridCellSize, currentColorChoice);
                const pixel = {
                    x: newX,
                    y: newY,
                    color: currentColorChoice
                }
                const pixelRef = db.collection(GAME_COLLECTION_NAME).doc(`${pixel.x}-${pixel.y}`);
                pixelRef.set(pixel, { merge: true });
            });
        }
    }
}

cursor.addEventListener('click', function(event) {
    addMultiPixelIntoGame()
});

game.addEventListener('click', function(){
    addMultiPixelIntoGame()
})

function drawGrids(ctx, width, height, cellWidth, cellHeight) {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";

    for (let i = 0; i < width; i++) {
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, height);
    }

    for (let i = 0; i < height; i++) {
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(width, i * cellHeight);
    }
    ctx.stroke();
}
drawGrids(gridCtx, game.width, game.height, gridCellSize, gridCellSize);

game.addEventListener('mousemove', function(event) {
    const cursorLeft = event.clientX - (cursor.offsetWidth / 2);
    const cursorTop = event.clientY - (cursor.offsetHeight / 2);

    cursor.style.left = Math.floor(cursorLeft / gridCellSize) * gridCellSize + "px"
    cursor.style.top = Math.floor(cursorTop / gridCellSize) * gridCellSize + "px"
});

db.collection(GAME_COLLECTION_NAME).onSnapshot(function(querySnapshot){
    querySnapshot.docChanges().forEach(function(change){
        const{ x, y, color} = change.doc.data()
        createPixel(x, y, color)
    })
})

// Get elements
const txtEmail = document.getElementById('email');
const txtPassword = document.getElementById('password');
const btnLogin = document.getElementById('login');
const btnSignUp = document.getElementById('signup');
const btnLogout = document.getElementById('logout');
const openModal = document.getElementById('openModal');
const authForm = document.getElementById('authForm');
const modal = document.getElementById('modal');
const close = document.getElementById('close');
const pixelSizeInputContainer = document.getElementById('pixel-size-container');
const pixelSizeInput = document.getElementById('pixel-size');
const pixelSizeValue = document.getElementById('pixel-size-value');

close.addEventListener('click', () => {
    modal.style.display = 'none';
});

openModal.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Add login event
authForm.addEventListener('submit', e => {
    e.preventDefault();
    // Get email and password
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    // Sign in
    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.then(credentials => {
        // Get user ID
        checkIsAdmin(credentials.user.uid);
    }).catch(e => console.log(e.message));
});

function checkIsAdmin(uid) {
    // Check if user is an admin
    const db = firebase.firestore();
    db.collection('admins').doc(uid).get().then(doc => {
        if (doc.exists) {
            pixelSizeInputContainer.style.display = doc.data().isAdmin ? "block" : "none"
        } else {
            console.log("Pas de données correspondantes !");
            pixelSizeInputContainer.style.display = 'none';
        }
    }).catch(error => {
        console.log("Erreur lors de l'obtention du document :", error);
    });
}

// Add signup event
btnSignUp.addEventListener('click', e => {
    // Get email and password
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    // Sign up
    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
});

btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
});

// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log("firebaseUser login :", firebaseUser);
        btnLogout.style.display = 'block';
        openModal.style.display = 'none';
        modal.style.display = 'none';
        pixelSizeInputContainer.style.display = 'none';
        checkIsAdmin(firebaseUser.uid);
    } else {
        btnLogout.style.display = 'none';
        openModal.style.display = 'block';
        pixelSizeInputContainer.style.display = 'none';
    }
});

function getSliderThumbPosition(inputElement) {
    // Get the current value, min, and max of the input element
    const value = parseInt(inputElement.value);
    const min = inputElement.min ? parseInt(inputElement.min) : 1;
    const max = inputElement.max ? parseInt(inputElement.max) : 30;
  
    // Calculate the percentage of the current value
    const percentage = (value - min) / (max - min);
    // Get the dimensions of the input element
    const rect = inputElement.getBoundingClientRect();
    // Calculate the x position of the thumb
    const thumbX = rect.left + (percentage * (rect.width - 50));
    // Calculate the y position of the thumb
    const thumbY = rect.top;
  
    return { x: thumbX, y: thumbY };
}

pixelSizeInput.addEventListener('change', (e) => {
    pixelSize = parseInt(e.target.value);
    pixelSizeValue.innerHTML = pixelSize;
    pixelSizeValue.style.left = (getSliderThumbPosition(pixelSizeInput).x +5)+ 'px';
})

function positionPixelSizeValue() {
    pixelSize = document.getElementById('pixel-size').value;
    pixelSizeValue.innerHTML = pixelSize;
    pixelSizeValue.style.left = (getSliderThumbPosition(pixelSizeInput).x +5)+ 'px';
}
positionPixelSizeValue()
