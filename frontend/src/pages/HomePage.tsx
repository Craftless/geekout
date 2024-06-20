import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex w-full h-[100svh] max-h-screen flex-col justify-center items-center gap-2">
      {/* <JoinRoomForm /> */}
      <div>
        <Button variant={"link"}>
          <Link to="/auth">Login as Teacher</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
