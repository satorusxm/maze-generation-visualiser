const mainCnv = document.querySelector("#mainCanvas");
let flag = null;
let arr = null;

document.addEventListener('resize', window.location.reload);

// Initialization function
function init() {
    mainCnv.width = document.querySelector("#container").clientWidth;
    mainCnv.height = document.querySelector("#container").clientHeight;

    document.querySelector("#startBtn").addEventListener("click", () => {
        let w = document.querySelector("#widthInput").value;
        let h = document.querySelector("#heightInput").value;

        generate(w, h);
    });

    return;
}

class Block {
    constructor() {
        this.t = 1;
        this.l = 1;
        this.d = 1;
        this.r = 1;
        this.visited = 0;
        this.tracked = 0;
        this.solution = 0;
        this.path = [];
    }
}

// Checks if address exists in arr
function addrExists(r, c) {
    return r >= 0 && r < arr.length && c >= 0 && c < arr[0].length;
}

// Draw a block on the canvas
function drawBlock(r, c, showTrack) {
    if (!addrExists(r, c)) return;

    let b = arr[r][c];
    let wallThickness = 2 * ((mainCnv.width / 865) + (mainCnv.height / 706)) / 2;
    let blockWidth = (mainCnv.width / arr[0].length) - (2 * wallThickness);
    let blockHeight = (mainCnv.height / arr.length) - (2 * wallThickness);
    let totalWidth = blockWidth + 2 * wallThickness;
    let totalHeight = blockHeight + 2 * wallThickness;

    let cntxt = mainCnv.getContext("2d");
    cntxt.clearRect(c * totalWidth, r * totalHeight, totalWidth, totalHeight);
    cntxt.fillStyle = "green";
    // Draw the vertices
    cntxt.fillRect(c * totalWidth, r * totalHeight, wallThickness, wallThickness);
    cntxt.fillRect(c * totalWidth + totalWidth - wallThickness, r * totalHeight, wallThickness, wallThickness);
    cntxt.fillRect(c * totalWidth, r * totalHeight + totalHeight - wallThickness, wallThickness, wallThickness);
    cntxt.fillRect(c * totalWidth + totalWidth - wallThickness, r * totalHeight + totalHeight - wallThickness, wallThickness, wallThickness);
    // Draw the walls
    if (b.t == 1)
        cntxt.fillRect(c * totalWidth + wallThickness, r * totalHeight, blockWidth, wallThickness);
    if (b.r == 1)
        cntxt.fillRect(c * totalWidth + totalWidth - wallThickness, r * totalHeight + wallThickness, wallThickness, blockHeight);
    if (b.d == 1)
        cntxt.fillRect(c * totalWidth + wallThickness, r * totalHeight + totalHeight - wallThickness, blockWidth, wallThickness);
    if (b.l == 1)
        cntxt.fillRect(c * totalWidth, r * totalHeight + wallThickness, wallThickness, blockHeight);
    // Draw inside the block
    let drawInside = false;
    if (b.solution == 1) {
        cntxt.fillStyle = "red";
        drawInside = true;
    } else if (showTrack && b.tracked == 1) {
        cntxt.fillStyle = "white";
        drawInside = true;
    }

    if (drawInside) {
        cntxt.fillRect(c * totalWidth + (totalWidth - wallThickness) / 2, r * totalHeight + (totalHeight - wallThickness) / 2, wallThickness, wallThickness);
    }
}

function drawMaze() {

    let i = 0;
    while (i < arr.length) {
        let j = 0;
        while (j < arr[i].length) {
            drawBlock(i, j);
            j += 1;
        }
        i += 1;
    }
}

async function generate(colCount, rowCount) {
    // Create the array
    arr = [];
    let i = 0;
    while (i < rowCount) {
        let a = [];
        let j = 0;
        while (j < colCount) {
            a.push(new Block());
            j += 1;
        }
        arr.push(a);
        i += 1;
    }

    // Recursive helper function in maze generation
    async function helper(r, c) {
        let currentBlock = arr[r][c];
        currentBlock.visited = 1;

        let addrs = [
            [r - 1, c],
            [r, c + 1],
            [r + 1, c],
            [r, c - 1]
        ];

        while (addrs.length > 0) {
            let targetAddrInd = Math.floor(Math.random() * addrs.length);
            let targetAddr = addrs[targetAddrInd];
            if (addrExists(...targetAddr)) {
                let targetBlock = arr[targetAddr[0]][targetAddr[1]];

                if (targetBlock.visited == 0)
                {
                    let delR = r - targetAddr[0],
                    delC = c - targetAddr[1];
                    
                    // Removing Horizontal Walls => Walls along the Vertical Axis
                    if (delR == 1) {
                        targetBlock.d = 0;
                        currentBlock.t = 0;
                    } else if (delR == -1) {
                        targetBlock.t = 0;
                        currentBlock.d = 0;
                    }

                    // Removing Horizontal Walls => Walls along the Horizontal Axis
                    if (delC == 1) {
                        targetBlock.r = 0;
                        currentBlock.l = 0;
                    } else if (delC == -1) {
                        targetBlock.l = 0;
                        currentBlock.r = 0;
                    }

                    drawBlock(r, c, false);
                    drawBlock(...targetAddr, false);

                    await new Promise((res, rej) => {
                        setTimeout(res, 0);
                    });

                    await helper(...targetAddr);
                }
            }

            addrs.splice(targetAddrInd, 1);
        }
    }
    
    let cntxt = mainCnv.getContext("2d");
    cntxt.fillStyle = "black";
    cntxt.fillRect(0, 0, mainCnv.width, mainCnv.height);

    document.querySelector("#startBtn").disabled = true;
    document.querySelector("#solveBtn").disabled = true;

    // Generate the maze
    await helper(0, 0);
    
    drawMaze();

    document.querySelector("#startBtn").disabled = false;
    document.querySelector("#solveBtn").disabled = false;

    return;
}

// Solving Mechanism
document.querySelector("#solveBtn").addEventListener("click", async () => {
    if (arr == null) return;

    function canGo(fromAddr, toAddr) {
        let delR = fromAddr[0] - toAddr[0];
        let delC = fromAddr[1] - toAddr[1];
        let from = arr[fromAddr[0]][fromAddr[1]];
        let to = arr[toAddr[0]][toAddr[1]];

        if (delR == 1) {
            return from.t == 0 && to.d == 0;
        } else if (delR == -1) {
            return from.d == 0 && to.t == 0;
        } else if (delC == 1) {
            return from.l == 0 && to.r == 0;
        } else if (delC == -1) {
            return from.r == 0 && to.l == 0;
        } else return true;
    }

    async function helper(fromAddr, toAddr) {
        if (toAddr === undefined) {
            toAddr = fromAddr;
        }
        if (!addrExists(...fromAddr) || !addrExists(...toAddr)) return;
        let from = arr[fromAddr[0]][fromAddr[1]];
        let to = arr[toAddr[0]][toAddr[1]];

        to.path = from.path.slice(0);
        to.path.push(from);

        to.tracked = 1;

        drawBlock(...toAddr, true);

        let res = false;

        // If it's the final block
        if (to == arr[0][0]) {
            to.path.forEach(b => {
                console.log(b);
                b.solution = 1;
            });
            to.solution = 1;

            res = true;
        } else {
            let [r, c] = toAddr;
            let addrs = [
                [r - 1, c],
                [r, c + 1],
                [r + 1, c],
                [r, c - 1]
            ]

            while (addrs.length > 0) {
                let targetAddrInd = Math.floor(Math.random() * addrs.length);
                let targetAddr = addrs[targetAddrInd];
                if (addrExists(...targetAddr)) {
                    let targetBlock = arr[targetAddr[0]][targetAddr[1]];

                    if (targetBlock.tracked == 0 && canGo(toAddr, targetAddr)) {
                        await new Promise((res, rej) => {
                            window.setTimeout(res, 1);
                        });
                        res = await helper(toAddr, targetAddr);

                        if (res) break;
                    }
                }

                addrs.splice(targetAddrInd, 1);
            }
        }

        return res;
    }

    document.querySelector("#startBtn").disabled = true;
    document.querySelector("#solveBtn").disabled = true;

    // Generate the maze
    await helper([arr.length - 1, arr[0].length - 1]);
    
    drawMaze();

    document.querySelector("#startBtn").disabled = false;
    document.querySelector("#solveBtn").disabled = false;

    return;
});

init();