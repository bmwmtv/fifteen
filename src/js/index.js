const gameNode = document.getElementById('game');
const containerNode = document.getElementById('fifteen');
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;

if (itemNodes.length !== 16) {
    throw new Error(`Должно быть ровно ${countItems} items in HTML`);
}

// 1. Position 
itemNodes[countItems - 1].style.display = 'none';
let matrix = getMatrix(
    itemNodes.map((item) => Number(item.dataset.matrixId))
);

setPositionItems(matrix);

// 2. Shuffle
const maxShuffleCount = 50;
let timer;
const shuffledClassName = 'gameShuffle';
document.getElementById('shuffle').addEventListener('click', () => {

    randomSwap(matrix);
    setPositionItems(matrix);
    
    
    let shuffleCount = 0;
    clearInterval(timer);
    gameNode.classList.add(shuffledClassName);
    
        timer = setInterval(() => {
            randomSwap(matrix);
            setPositionItems(matrix);

            shuffleCount += 1;

            if (shuffleCount >= maxShuffleCount){
                gameNode.classList.remove(shuffledClassName);
                clearInterval(timer)
            }
        }, 70);
    

    
})

// 3. Change position by click
const blankNumber = 16;

containerNode.addEventListener('click', (event) => {
    const buttonNode = event.target.closest('button');
    if (!buttonNode) {
        return;
    }
    
    const buttonNumber = Number(buttonNode.dataset.matrixId);
    const buttonCords = findCoordinatesByNumber(buttonNumber, matrix);
    const blankCords = findCoordinatesByNumber(blankNumber, matrix);

    const isValid = isValidForSwap(buttonCords, blankCords);
    
    if (isValid) {
        swap(blankCords, buttonCords, matrix);
        setPositionItems(matrix);
    }
})

// 4. Change position by key arrows
window.addEventListener('keydown', (event) => { 
    if (!event.key.includes('Arrow')){
        return;
    };

    const blankCords = findCoordinatesByNumber(blankNumber, matrix);
    const buttonCords = {
        x: blankCords.x,
        y: blankCords.y,
    };
    const direction = event.key.split('Arrow')[1].toLowerCase();
    const maxIndexMatrix = matrix.length;
    
    switch (direction) {
        case 'up':
            buttonCords.y += 1;
            break;
        case 'down':
            buttonCords.y -= 1;
            break;
        case 'left':
            buttonCords.x += 1;
            break;
        case 'right':
            buttonCords.x -= 1;
            break;

    }

    if (buttonCords.y >= maxIndexMatrix || buttonCords.y < 0 ||
        buttonCords.x >= maxIndexMatrix || buttonCords.x < 0) {
            return;
        }
    
        swap(blankCords, buttonCords, matrix);
        setPositionItems(matrix);

})

// 5. Show won




// Helpers

function  getMatrix(arr) {
    const matrix = [[], [], [], []];
    let x = 0;
    let y = 0;

    for (let i = 0; i < arr.length; i += 1) {
        if ( x >= 4) {
            y += 1;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x += 1;
    }
    return matrix;
}

function setPositionItems (matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[y].length; x += 1) {
            const value = matrix[y][x];
            const node = itemNodes[value - 1];
            setNodeStyles(node, x, y);
        }
    }

}

function setNodeStyles (node , x , y) {
    const shiftPs = 100;
    node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;

}

function shuffleArray(arr) {
    return arr
        .map(value => ({value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);
}



function findCoordinatesByNumber ( number , matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[y].length; x += 1) {
            if ( matrix [y][x] === number) {
                return {x,y};
            }
        }
    }
    return null;
}

function isValidForSwap(coords1, coords2) {
    const diffX = Math.abs(coords1.x - coords2.x);
    const diffY = Math.abs(coords1.y - coords2.y);

    return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y);

}

function swap (coords1, coords2 , matrix){
    const coords1Number = matrix[coords1.y][coords1.x];
    matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
    matrix[coords2.y][coords2.x] = coords1Number;
    
    if (isWon(matrix)) {
        addWonClass();
    }

}

const winFlatArr = new Array(16).fill(0).map((item, index) => index + 1);
function isWon (matrix) {
    const flatMatrix = matrix.flat();
    for (let i = 0; i < winFlatArr.length ; i += 1) {
        if (flatMatrix[i] !== winFlatArr[i]) {
            return false;
        }
    }

    return true;


}

const wonClass = 'fifteenWon';
function addWonClass() {
    setTimeout(() => {
        containerNode.classList.add(wonClass);
        setTimeout(() => {
            containerNode.classList.remove(wonClass);
        }, 1000);

    }, 200);


}

let blockedCoords = null;
function randomSwap(matrix) {
    const blankCords = findCoordinatesByNumber(blankNumber, matrix);
    const validCords = findValidCoords({
        blankCords,
        matrix,
        blockedCoords,
    });

    const swapCoords = validCords [
        Math.floor(Math.random() * validCords.length)
    ];

    swap(blankCords, swapCoords, matrix);
    blockedCoords = blankCords;

}

function findValidCoords ({blankCords, matrix, blockedCoords} ) {
    const validCords = [];
    for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[y].length; x += 1) {
            if (isValidForSwap({x, y}, blankCords)) {
                if (!blockedCoords || !(
                    blockedCoords.x === x && blockedCoords.y === y
                )) {
                    validCords.push({x, y});
                }
            }
        }
    }
    return validCords;
    
}