document.addEventListener("DOMContentLoaded", () => {
    console.log("🎱 Bingo Page Loaded!");

    const bingoBoard = document.getElementById("bingoBoard");
    const callNumberButton = document.getElementById("callNumber");
    const calledNumberDisplay = document.getElementById("calledNumber");

    let numbers: number[] = [];
    let calledNumbers: number[] = [];

    // Generate unique Bingo numbers (1-75)
    function generateBingoNumbers(): number[] {
        let nums = [];
        for (let i = 1; i <= 75; i++) {
            nums.push(i);
        }
        // Shuffle
        nums.sort(() => Math.random() - 0.5);

        // Take first 25 for the board
        return nums.slice(0, 25);
    }


    // Render Bingo board
    function renderBingoBoard() {
        numbers = generateBingoNumbers();

        console.log("Generated board numbers:", numbers);

        bingoBoard!.innerHTML = ""; // Clear previous board

        numbers.forEach((num) => {
            const cell = document.createElement("div");
            cell.classList.add("bingo-cell");
            cell.textContent = num.toString();
            cell.dataset.number = num.toString();

            cell.addEventListener("click", () => {
                cell.classList.toggle("marked");
            });

            bingoBoard?.appendChild(cell);
        });
    }



    // Call a random number
    function callRandomNumber() {
        if (numbers.length === 0) {
            alert("🎉 All numbers have been called!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * numbers.length);
        const calledNumber = numbers.splice(randomIndex, 1)[0];
        calledNumbers.push(calledNumber);

        calledNumberDisplay!.textContent = `🎲 Called Number: ${calledNumber}`;

        // Highlight called number on board
        document.querySelectorAll(".bingo-cell").forEach((cell) => {
            if (cell.textContent === calledNumber.toString()) {
                cell.classList.add("marked");
            }
        });
    }

    // Initialize game
    renderBingoBoard();

    // Event Listener for calling numbers
    callNumberButton?.addEventListener("click", callRandomNumber);
});
