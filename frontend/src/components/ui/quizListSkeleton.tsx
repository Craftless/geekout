function QuizListSkeleton() {
  return (
    <div className="">
      <div className="flex border-b-2 border-white/20 py-2 justify-between items-center">
        <div className="flex justify-center">
          <div className="skeleton w-64 h-32"></div>
          <div className="">
            <div className="skeleton h-8 w-26"></div>
            <div className="skeleton h-4 w-26"></div>
            <div className="skeleton h-4 w-26"></div>
          </div>
        </div>
        <div className="pr-5 italic">
          <div className="skelton h-4 w-26"></div>
        </div>
      </div>
    </div>
  );
}

export { QuizListSkeleton };
