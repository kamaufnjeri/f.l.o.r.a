import React, { useEffect, useState, useRef } from 'react';
import UnAuthorizedHeader from '../../components/unauthorized/UnAuthorizedHeader'

const PLAYER_X = 'X';
const PLAYER_0 = 'O';

const winningCombinations = [
  // columns
  {
    combo: [0, 1, 2],
    strike: ' w-full top-[15%]',
  },
  {
    combo: [3, 4, 5],
    strike: ' w-full top-[48%]',
  },
  {
    combo: [6, 7, 8],
    strike: ' w-full top-[83%]',
  },
  // rows
  {
    combo: [0, 3, 6],
    strike: ' h-full top-0 left-[16%]',
  },
  {
    combo: [1, 4, 7],
    strike: ' h-full top-0 left-[48%]',
  },
  {
    combo: [2, 5, 8],
    strike: ' h-full top-0 left-[83%]',
  },
  // diagonals
  {
    combo: [0, 4, 8],
    strike: ' w-full top-[50%] left-0 transform rotate-45',
  },
  {
    combo: [2, 4, 6],
    strike: ' w-full top-[48%] left-0 transform -rotate-45',
  },
];

const getClass = (index, value) => {
  let style = 'border-slate-600 ';
  if (![6, 7, 8].includes(index)) {
    style += 'border-b-4 ';
  }
  if (![2, 5, 8].includes(index)) {
    style += 'border-r-4 ';
  }

  if (value === PLAYER_0) {
    style += ' text-red-500';
  } else {
    style += ' text-blue-800';
  }
  return style;
};

const Home = () => {
  const [tiles, setTiles] = useState(Array(9).fill(null));
  const [playersTurn, setPlayersTurn] = useState(PLAYER_X);
  const strikeParentRef = useRef(null); // Use useRef for strikeParentRef
  const [marks, setMarks] = useState([0, 0]);
  const [components, setComponents] = useState([]);
  const [winner, setWinner] = useState('');

  const handleTileClick = (index) => {
    if (tiles[index] !== null || tiles.every((tile) => tile !== null)) {
      return;
    }

    setTiles((prevTiles) => {
      const newTiles = [...prevTiles];
      newTiles[index] = playersTurn;
      return newTiles;
    });

    setPlayersTurn((prevPlayer) => (prevPlayer === PLAYER_X ? PLAYER_0 : PLAYER_X));
  };

  const resetGame = () => {
    setMarks([0, 0]);
    setComponents([]);
    setWinner('');
    setTiles(Array(9).fill(null));
    setPlayersTurn(PLAYER_X);
  };

  const checkWinner = () => {
    let xMarks = 0;
    let oMarks = 0;

    winningCombinations.map(({ combo, strike }, index) => {
      const [a, b, c] = combo;

      if (tiles[a] && tiles[a] === tiles[b] && tiles[a] === tiles[c]) {
        setComponents((prev) => [...prev, <StrikeThrough style={strike} key={`${index}-${strike}`} />]);
        if (tiles[a] === PLAYER_X) {
          xMarks = xMarks + 1;
        } else {
          oMarks = oMarks + 1;
        }
      }
    });
    setMarks([xMarks, oMarks]);

    if (tiles.every((tile) => tile !== null)) {
      if (oMarks > xMarks) {
        setWinner(`Winner is ${PLAYER_0}`);
      } else if (xMarks > oMarks) {
        setWinner(`Winner is ${PLAYER_X}`);
      } else if (xMarks === oMarks) {
        setWinner('Draw');
      }
    }
  };

  useEffect(() => {
    checkWinner();
  }, [tiles]);

  return (
    <div>
      <UnAuthorizedHeader />
      <div className="bg-white w-screen h-screen flex justify-center items-center flex-col gap-3">
        <span className="font-extrabold text-lg">Tic Tac Toe</span>
        <div className="flex flex-row gap-20 font-extrabold text-xl">
          <span className="text-blue-800">{PLAYER_X} - {marks[0]}</span>
          <span className="text-red-500">{PLAYER_0} - {marks[1]}</span>
        </div>
        <div className="relative">
          <div className="grid grid-cols-3">
            {tiles &&
              tiles.map((tile, index) => (
                <Tile value={tile} className={getClass(index, tile)} key={index} handleClick={() => handleTileClick(index)} />
              ))}
          </div>
          <div ref={strikeParentRef}>{components}</div>
        </div>
        <button
          className="border-blue-800 bg-white border-2 w-[20%] p-1 h-10 rounded-md cursor-pointer hover:bg-blue-800 hover:shadow-sm hover:text-white text-center"
          onClick={resetGame}
        >
          Reset
        </button>

        {winner ? (
          <div className="text-center p-1 rounded-md w-[20%] h-10 border-dashed border border-green-600">{winner}</div>
        ) : (
          <div className="w-[20%] h-10"></div>
        )}
      </div>
    </div>
  );
};

export default Home;

// Tile Component
const Tile = ({ value, className, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className={`${className} w-20 h-20 font-extrabold cursor-pointer text-lg flex items-center justify-center`}
    >
      {value}
    </div>
  );
};

// StrikeThrough Component
const StrikeThrough = ({ style }) => {
  return <div className={`border-orange-600 border absolute ${style}`} />;
};
