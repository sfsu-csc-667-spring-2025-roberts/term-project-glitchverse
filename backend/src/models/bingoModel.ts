export const generateBingoCard = (): number[][] => {
    const card: number[][] = [];
    const columns: number[][] = [[], [], [], [], []];
  
    for (let col = 0; col < 5; col++) {
      let start = col * 15 + 1;
      let end = start + 15;
  
      const numbers: number[] = Array.from({ length: 15 }, (_, i) => i + start)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
  
      columns[col] = numbers;
    }
  
    // Assemble 5x5 card
    for (let row = 0; row < 5; row++) {
      card[row] = columns.map((col) => col[row]);
    }
  
    // Center is a free space
    card[2][2] = 0;
  
    return card;
  };
  
  export const checkBingoWin = (card: number[][], drawnNumbers: Set<number>): boolean => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      if (card[row].every((num) => num === 0 || drawnNumbers.has(num))) return true;
    }
  
    // Check columns
    for (let col = 0; col < 5; col++) {
      if (card.every((row) => row[col] === 0 || drawnNumbers.has(row[col]))) return true;
    }
  
    // Check diagonals
    if (
      card.every((row, i) => row[i] === 0 || drawnNumbers.has(row[i])) ||
      card.every((row, i) => row[4 - i] === 0 || drawnNumbers.has(row[4 - i]))
    ) {
      return true;
    }
  
    return false;
  };
  