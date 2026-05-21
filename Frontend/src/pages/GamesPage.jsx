import React, { useState } from 'react';
import { Compass, HelpCircle, Layers, MapPin, Trophy, X, Coins, Gift, Sparkles, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PLAY_AND_WIN } from '../data/mockData';
import SnakeGame from '../components/games/SnakeGame';

export default function GamesPage() {
  const navigate = useNavigate();
  const { coins, addCoins } = useApp();
  const [activeGame, setActiveGame] = useState(null); // 'spin' | 'quiz' | 'scratch' | 'treasure' | null
  const [gameFeedback, setGameFeedback] = useState(null);

  // Spin Game State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  // Quiz Game State
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const quizQuestion = {
    q: "Which gift is traditionally associated with a 25th wedding anniversary?",
    options: ["Silver", "Gold", "Diamond", "Platinum"],
    correctIdx: 0,
    reward: 50
  };

  // Scratch State
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isScratching, setIsScratching] = useState(false);

  // Treasure State
  const [openedChest, setOpenedChest] = useState(null);
  const chests = [
    { id: 1, reward: 75, label: "Golden Chest" },
    { id: 2, reward: 200, label: "Ruby Chest" },
    { id: 3, reward: 20, label: "Bronze Chest" }
  ];

  const handleOpenGame = (gameId) => {
    setGameFeedback(null);
    setQuizSubmitted(false);
    setSelectedQuizAnswer(null);
    setScratchedPercent(0);
    setOpenedChest(null);
    
    if (gameId === 'game-1') setActiveGame('spin');
    else if (gameId === 'game-2') setActiveGame('quiz');
    else if (gameId === 'game-3') setActiveGame('scratch');
    else if (gameId === 'game-4') setActiveGame('treasure');
    else setActiveGame(gameId);
  };

  // Spin & Win logic
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setGameFeedback(null);

    const randomRotations = 5 + Math.floor(Math.random() * 5); // 5 to 10 full turns
    const sectorAngle = 72; // 5 sectors of 72 degs (Total 360)
    const prizes = [
      { name: "50 Coins", value: 50 },
      { name: "100 Coins", value: 100 },
      { name: "Try Again", value: 0 },
      { name: "20 Coins", value: 20 },
      { name: "150 Coins", value: 150 }
    ];

    const chosenSector = Math.floor(Math.random() * prizes.length);
    const targetAngle = spinAngle + (randomRotations * 360) + (chosenSector * sectorAngle);

    setSpinAngle(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = prizes[chosenSector];
      if (wonPrize.value > 0) {
        addCoins(wonPrize.value);
        setGameFeedback({
          success: true,
          msg: `Congratulations! You won ${wonPrize.name}! 🎉`,
          amount: wonPrize.value
        });
      } else {
        setGameFeedback({
          success: false,
          msg: "Ah! Better luck next time. Don't worry, try again tomorrow!",
          amount: 0
        });
      }
    }, 4000);
  };

  // Quiz logic
  const handleQuizAnswer = (idx) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswer(idx);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizAnswer === null || quizSubmitted) return;
    setQuizSubmitted(true);
    if (selectedQuizAnswer === quizQuestion.correctIdx) {
      addCoins(quizQuestion.reward);
      setGameFeedback({
        success: true,
        msg: `Correct Answer! +${quizQuestion.reward} Coins credited to your wallet! 🧠`,
        amount: quizQuestion.reward
      });
    } else {
      setGameFeedback({
        success: false,
        msg: "Oops! Incorrect answer. The correct answer was Silver.",
        amount: 0
      });
    }
  };

  // Scratch logic
  const handleScratch = () => {
    if (scratchedPercent >= 100) return;
    setIsScratching(true);
    setTimeout(() => {
      setScratchedPercent(100);
      setIsScratching(false);
      addCoins(75);
      setGameFeedback({
        success: true,
        msg: "Fantastic! You revealed and earned 75 Coins! 🌟",
        amount: 75
      });
    }, 1500);
  };

  // Treasure Hunt logic
  const handleChestClick = (chest) => {
    if (openedChest !== null) return;
    setOpenedChest(chest.id);
    addCoins(chest.reward);
    setGameFeedback({
      success: true,
      msg: `Excellent choice! The ${chest.label} revealed +${chest.reward} Coins! 🗝️`,
      amount: chest.reward
    });
  };

  // Icon mapper
  const renderGameIcon = (id, className = "w-6 h-6") => {
    if (id === 'game-1') return <Compass className={className} />;
    if (id === 'game-2') return <HelpCircle className={className} />;
    if (id === 'game-3') return <Layers className={className} />;
    if (id === 'game-4') return <MapPin className={className} />;
    return <Trophy className={className} />;
  };

  return (
    <div className="flex-grow p-4 space-y-6 pb-6 animate-fade-in">
      
      {/* Custom Gaming Header */}
      <div className="flex items-center justify-between pb-3 pt-4 px-4 -mx-4 -mt-4 bg-orange-100/90 border-b border-orange-200/60 backdrop-blur-md sticky top-0 z-20 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-orange-200 text-[#FF6E54] hover:bg-orange-50 active:scale-95 transition-all cursor-pointer shadow-sm shadow-[#FF6E54]/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-[#02006c] uppercase tracking-widest font-syne drop-shadow-sm">Playground</h1>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      {/* Upper balance board */}
      <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between border border-slate-700/50">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold flex items-center gap-1.5">
            Mynzo <span className="text-[#FF6E54]">Playground</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">
            Accumulate coins and spend them on gifts!
          </p>
        </div>

        {/* Balance Badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold leading-none uppercase tracking-wider">Balance</span>
            <span className="text-base font-black text-amber-300 mt-0.5">{coins}</span>
          </div>
        </div>
      </div>

      {/* Main grid of game widgets */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-black text-[#0F172A]">Games Zone</h3>
          <p className="text-[10px] text-slate-400 font-semibold italic">Fun khelo, rewards lelo! 🥳</p>
        </div>

        <div className="w-full">
          <button
            onClick={() => handleOpenGame('snake')}
            className="w-full border border-orange-200 p-5 rounded-3xl flex items-center justify-between gap-4 transition-all duration-300 active:scale-95 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-200 text-2xl">
                🐍
              </div>
              <div>
                <h4 className="text-sm font-black text-[#02006c]">Snake & Chase</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Play the classic game & earn coins!</p>
              </div>
            </div>
            <div className="bg-[#FF6E54] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm shadow-[#FF6E54]/30">
              PLAY
            </div>
          </button>
        </div>
      </div>

      {/* Spinner Wheel Game Overlay */}
      {activeGame === 'spin' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-up space-y-6">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center justify-center gap-1.5">
                🎡 Spin & Win
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Spin and win exciting gift coins!</p>
            </div>

            {/* Spinner Component */}
            <div className="flex items-center justify-center py-4 relative">
              {/* Spinner Pointer arrow */}
              <div className="absolute top-0 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-red-600 drop-shadow-sm"></div>
              
              <div 
                className="w-48 h-48 rounded-full border-4 border-slate-100 shadow-xl relative overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${spinAngle}deg)`,
                  transitionDuration: isSpinning ? '4s' : '0.5s',
                  background: 'conic-gradient(#FDA4AF 0% 20%, #FECDD3 20% 40%, #FFE4E6 40% 60%, #FDA4AF 60% 80%, #FECDD3 80% 100%)'
                }}
              >
                {/* Sector Text Items */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0F172A]">
                  <span className="absolute translate-y-[-70px]">50 Coins</span>
                  <span className="absolute translate-x-[64px] rotate-[72deg]">100 Coins</span>
                  <span className="absolute translate-x-[40px] translate-y-[52px] rotate-[144deg]">Try Again</span>
                  <span className="absolute translate-x-[-40px] translate-y-[52px] rotate-[216deg]">20 Coins</span>
                  <span className="absolute translate-x-[-64px] rotate-[288deg]">150 Coins</span>
                </div>
                <div className="absolute inset-12 bg-white rounded-full flex items-center justify-center border-4 border-slate-100 shadow-inner">
                  <Coins className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all duration-300 ${
                isSpinning
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#FF6E54] hover:bg-orange-600 text-white active:scale-95 shadow-md shadow-orange-500/20'
              }`}
            >
              {isSpinning ? "SPINNING..." : "TAP TO SPIN"}
            </button>

            {/* Reward Feedback Popup */}
            {gameFeedback && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-fade-in ${
                gameFeedback.success ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-rose-50 border-rose-100 text-rose-950'
              }`}>
                {gameFeedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                <p className="text-[11px] font-bold leading-normal">{gameFeedback.msg}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Quiz Game Overlay */}
      {activeGame === 'quiz' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-up space-y-6">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center justify-center gap-1.5">
                🧠 Daily Quiz
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Answer correctly to secure +50 Coins!</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-700 leading-normal">{quizQuestion.q}</p>
              </div>

              <div className="space-y-2">
                {quizQuestion.options.map((option, idx) => {
                  let btnStyle = "border-slate-100 hover:bg-slate-50 text-slate-700";
                  if (selectedQuizAnswer === idx) {
                    btnStyle = "border-orange-500 bg-orange-50 text-orange-950 font-bold";
                  }
                  if (quizSubmitted) {
                    if (idx === quizQuestion.correctIdx) {
                      btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                    } else if (selectedQuizAnswer === idx) {
                      btnStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold";
                    } else {
                      btnStyle = "border-slate-100 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizAnswer(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all duration-300 ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={selectedQuizAnswer === null}
                className={`w-full py-3 rounded-2xl font-black text-xs transition-all duration-300 ${
                  selectedQuizAnswer === null
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#FF6E54] hover:bg-orange-600 text-white active:scale-95'
                }`}
              >
                SUBMIT ANSWER
              </button>
            ) : (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-fade-in ${
                gameFeedback.success ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-rose-50 border-rose-100 text-rose-950'
              }`}>
                {gameFeedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                <p className="text-[11px] font-bold leading-normal">{gameFeedback.msg}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scratch Card Overlay */}
      {activeGame === 'scratch' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-up space-y-6">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center justify-center gap-1.5">
                ✨ Scratch Card
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Scratch the silver film to see what's inside!</p>
            </div>

            {/* Interactive Scratch Area */}
            <div className="flex justify-center py-2">
              <div 
                onClick={handleScratch}
                className="w-48 h-48 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner cursor-pointer"
              >
                {scratchedPercent < 100 ? (
                  /* Overlay silver layer */
                  <div className={`absolute inset-0 bg-slate-300 flex flex-col items-center justify-center transition-opacity duration-500 ${isScratching ? 'opacity-40' : 'opacity-100'}`}>
                    <Layers className="w-10 h-10 text-slate-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">TAP TO SCRATCH</span>
                  </div>
                ) : null}

                {/* Prize inside */}
                <Sparkles className="w-12 h-12 text-[#FF6E54] animate-bounce" />
                <h4 className="text-sm font-black text-[#0F172A] mt-2">75 COINS</h4>
                <p className="text-[9px] text-[#FF6E54] font-bold">Credited to wallet!</p>
              </div>
            </div>

            {gameFeedback && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 p-4 rounded-2xl flex items-start gap-3 border animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] font-bold leading-normal">{gameFeedback.msg}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treasure Hunt Overlay */}
      {activeGame === 'treasure' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-up space-y-6">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center justify-center gap-1.5">
                🗝️ Treasure Hunt
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Pick one of these mystery chests to unlock treasure!</p>
            </div>

            {/* Chest Grid */}
            <div className="grid grid-cols-3 gap-2 py-4">
              {chests.map((chest) => {
                const isSelected = openedChest === chest.id;

                return (
                  <button
                    key={chest.id}
                    disabled={openedChest !== null}
                    onClick={() => handleChestClick(chest)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                      isSelected 
                        ? 'bg-amber-50 border-amber-500 text-amber-950 scale-105 shadow-md' 
                        : openedChest !== null
                          ? 'border-slate-100 opacity-60'
                          : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <Gift className={`w-8 h-8 ${isSelected ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
                    <span className="text-[8px] font-extrabold uppercase leading-none text-slate-500">{chest.label}</span>
                    {isSelected && (
                      <span className="text-[9px] font-black text-amber-600 mt-1">+{chest.reward}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {gameFeedback && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 p-4 rounded-2xl flex items-start gap-3 border animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] font-bold leading-normal">{gameFeedback.msg}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snake & Chase Game Overlay */}
      {activeGame === 'snake' && (
        <SnakeGame onClose={() => setActiveGame(null)} addCoins={addCoins} />
      )}

    </div>
  );
}

