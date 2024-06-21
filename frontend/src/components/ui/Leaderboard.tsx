import { GameContext } from "@/context/game-context";
import { ArrowUpNarrowWide } from "lucide-react";
import { ReactNode, useContext } from "react";

const Leaderboard = ({ children }: { children: ReactNode }) => {
  const game = useContext(GameContext);
  const scoredArray = game.students.map((student) => {
    const totalScore = student.scoresByQuestion.reduce(
      (sum, score) => sum + score,
      0
    );
    return { ...student, totalScore: totalScore || 0 };
  });
  console.log(scoredArray, game.students);

  scoredArray.sort((a, b) => a.totalScore - b.totalScore);
  return (
    <div className="drawer drawer-end">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer"
          className="absolute right-10 top-30 btn btn-square drawer-button"
        >
          <ArrowUpNarrowWide size={24} />
        </label>
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="p-4 w-80 min-h-full bg-base-200 text-base-content  flex flex-col items-start">
          <h1 className="font-bold text-xl">Leaderboard</h1>
          <div className="divider"></div>
          <div className="w-full">
            {scoredArray.map((student) => (
              <div key={student.student} className="card w-full bg-white/10">
                <div
                  className="card-body flex justify-between w-full flex-row"
                  key={student.student}
                >
                  <div className="w-fit">
                    {" "}
                    <p>{student.student}</p>
                  </div>
                  <div>
                    {" "}
                    <p>{student.totalScore} points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
